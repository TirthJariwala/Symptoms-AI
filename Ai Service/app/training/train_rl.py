"""
app/training/train_rl.py
─────────────────────────
Fast RL training — MLflow disabled, embeddings cached in RAM.

Usage:
    python -c "from app.training.train_rl import train_rl_agent; train_rl_agent()"
"""

import math
import os
import time
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader

# ── Silence MLflow git warning completely ─────────────────────────
os.environ["GIT_PYTHON_REFRESH"] = "quiet"

from app.core.config import settings
from app.core.logger import logger
from app.models.rl.dqn_agent import DQNAgent
from app.models.rl.ddpg_agent import DDPGAgent
from app.models.cnn.resnet50 import ResNet50Classifier
from app.training.medmnist_dataset import get_dataset, get_num_classes


def _load_cnn(model_path: str, num_classes: int, device: torch.device) -> ResNet50Classifier:
    cnn = ResNet50Classifier(num_classes=num_classes, pretrained=False).to(device)
    if Path(model_path).exists():
        ckpt = torch.load(model_path, map_location=device)
        state_dict = ckpt.get("model_state_dict", ckpt)
        cnn.load_state_dict(state_dict)
        logger.info(f"✅ CNN loaded ← {model_path}")
    else:
        logger.warning(f"CNN not found at {model_path} — using random weights")
    cnn.eval()
    return cnn


def _build_embedding_cache(
    cnn: ResNet50Classifier,
    dataset_name: str,
    device: torch.device,
    max_samples: int = 500,
) -> tuple:
    """Load dataset ONCE, compute embeddings, cache in RAM."""
    logger.info(f"Building embedding cache ({max_samples} samples)...")

    dataset   = get_dataset(dataset_name, split="train")
    n_samples = min(max_samples, len(dataset))
    indices   = np.random.choice(len(dataset), n_samples, replace=False)
    subset    = torch.utils.data.Subset(dataset, indices)
    loader    = DataLoader(subset, batch_size=512, shuffle=False, num_workers=0)

    emb_list, lbl_list, conf_list, pred_list = [], [], [], []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            logits, embeddings = cnn(images)
            probs  = F.softmax(logits, dim=1)

            emb_list.append(embeddings.cpu())
            lbl_list.append(labels.cpu())
            conf_list.append(probs.max(dim=1)[0].cpu())
            pred_list.append(probs.argmax(dim=1).cpu())

    embeddings_np  = torch.cat(emb_list,  0).numpy().astype(np.float32)
    labels_np      = torch.cat(lbl_list,  0).numpy().astype(np.int32)
    confs_np       = torch.cat(conf_list, 0).numpy().astype(np.float32)
    preds_np       = torch.cat(pred_list, 0).numpy().astype(np.int32)

    logger.info(f"✅ Cache ready! {len(embeddings_np)} embeddings in RAM")
    return embeddings_np, labels_np, confs_np, preds_np


REWARD_TABLE = {
    (True,  "confirm_diagnosis"):        1.0,
    (True,  "refer_specialist"):         0.2,
    (True,  "request_further_imaging"):  0.2,
    (False, "confirm_diagnosis"):       -0.5,
    (False, "refer_specialist"):        -0.1,
    (False, "request_further_imaging"):  0.1,
}


def _reward(pred: int, true: int, action: str, conf: float) -> float:
    correct = (pred == true)
    if conf < settings.confidence_threshold:
        if action == "request_further_imaging": return  0.3
        if action == "confirm_diagnosis":       return -0.3
        return 0.1
    base = REWARD_TABLE.get((correct, action), 0.0)
    if correct and conf > 0.85:
        base *= 1.2
    return round(base, 4)


def train_rl_agent(
    agent_type: str = "dqn",
    n_episodes: int = 1000,
    dataset_name: str = "chest_xray",
    cnn_model_path: Optional[str] = None,
    max_samples: int = 500,
    run_name: Optional[str] = None,
) -> str:

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    logger.info("=" * 60)
    logger.info("RL Agent Training")
    logger.info(f"  Agent    : {agent_type.upper()}")
    logger.info(f"  Episodes : {n_episodes}")
    logger.info(f"  Dataset  : {dataset_name}")
    logger.info(f"  Samples  : {max_samples}")
    logger.info(f"  Device   : {device}")
    logger.info("=" * 60)

    # ── Auto-detect CNN ───────────────────────────────────────────
    if cnn_model_path is None:
        candidates = [
            f"./saved_models/cnn/resnet50_{dataset_name}_best.pt",
            "./saved_models/cnn/resnet50_chest_xray_best.pt",
            str(settings.cnn_model_path),
        ]
        cnn_model_path = next(
            (p for p in candidates if Path(p).exists()),
            candidates[0]
        )
    logger.info(f"  CNN      : {cnn_model_path}")

    # ── Load CNN + build cache ────────────────────────────────────
    num_classes = get_num_classes(dataset_name)
    cnn = _load_cnn(cnn_model_path, num_classes, device)
    embeddings, labels, confs, preds = _build_embedding_cache(
        cnn, dataset_name, device, max_samples
    )
    n_cached = len(embeddings)

    # ── RL Agent ──────────────────────────────────────────────────
    n_actions = len(settings.rl_actions)
    agent_type_lower = agent_type.lower()

    if agent_type_lower == "dqn":
        agent = DQNAgent(
            state_dim=settings.embedding_dim,
            n_actions=n_actions,
            action_labels=settings.rl_actions,
            epsilon_start=1.0,
            epsilon_end=0.05,
            epsilon_decay_steps=300,
        )
    elif agent_type_lower == "ddpg":
        agent = DDPGAgent(
            state_dim=settings.embedding_dim,
            action_dim=n_actions,
        )
    else:
        raise ValueError(
            f"Unknown agent_type: '{agent_type}'. Choose from: dqn, ddpg"
        )

    # ── Per-dataset save path: e.g. dqn_chest_xray_policy.pt ─────
    save_name = f"{agent_type_lower}_{dataset_name}_policy.pt"
    save_path = Path(settings.model_registry_path) / "rl" / save_name
    save_path.parent.mkdir(parents=True, exist_ok=True)
    logger.info(f"  Save to  : {save_path}")

    # ── Training loop — NO MLflow, NO disk reads ──────────────────
    logger.info("🚀 Starting fast training loop...")
    t_start          = time.time()
    episode_rewards  = []
    best_mean_reward = float("-inf")

    for episode in range(1, n_episodes + 1):
        ep_reward = 0.0

        for _ in range(10):
            idx   = np.random.randint(0, n_cached)
            state = embeddings[idx]

            if agent_type_lower == "dqn":
                action_idx = agent.select_action(state)
            else:
                action_idx = agent.select_discrete_action(state)

            action = settings.rl_actions[action_idx]
            reward = _reward(int(preds[idx]), int(labels[idx]), action, float(confs[idx]))

            next_idx   = np.random.randint(0, n_cached)
            next_state = embeddings[next_idx]

            agent.store_transition(state, action_idx, reward, next_state, True)
            agent.update()
            ep_reward += reward

        episode_rewards.append(ep_reward)

        # ── Epsilon decay — DQN only ──────────────────────────────
        if agent_type_lower == "dqn" and hasattr(agent, "_episode"):
            agent._episode += 1
            agent._epsilon = max(
                agent._epsilon_end,
                agent._epsilon_end + (settings.rl_epsilon_start - agent._epsilon_end)
                * math.exp(-agent._episode / agent._epsilon_decay),
            )
            if agent._episode % agent.target_update_freq == 0:
                agent._sync_target()

        # ── Log every 50 episodes ─────────────────────────────────
        if episode % 50 == 0:
            mean_reward = float(np.mean(episode_rewards[-50:]))
            elapsed     = time.time() - t_start
            eps_per_sec = episode / elapsed
            eta_sec     = (n_episodes - episode) / eps_per_sec
            epsilon     = getattr(agent, "_epsilon", 0.05)

            logger.info(
                f"Episode {episode:4d}/{n_episodes} | "
                f"reward={mean_reward:+.4f} | "
                f"ε={epsilon:.4f} | "
                f"speed={eps_per_sec:.1f} ep/s | "
                f"ETA={eta_sec/60:.1f} min"
            )

            if mean_reward > best_mean_reward:
                best_mean_reward = mean_reward
                agent.save(save_path)
                logger.info(f"  ✅ Best saved! reward={mean_reward:+.4f}")

    agent.save(save_path)

    total_time = time.time() - t_start
    logger.info("=" * 60)
    logger.info("✅ RL Training Complete!")
    logger.info(f"   Best reward  : {best_mean_reward:+.4f}")
    logger.info(f"   Total time   : {total_time/60:.1f} minutes")
    logger.info(f"   Saved to     : {save_path}")
    logger.info("=" * 60)
    return str(save_path)