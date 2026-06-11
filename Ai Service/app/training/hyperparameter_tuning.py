import itertools
from typing import Any, Dict, List

import mlflow

from app.core.config import settings
from app.core.logger import logger
from app.training.train_cnn import train_cnn


SEARCH_SPACE: Dict[str, List[Any]] = {
    "architecture": ["resnet50", "vgg16"],
    "lr": [1e-3, 1e-4, 5e-5],
    "epochs": [20],
}


def grid_search() -> List[Dict[str, Any]]:
    keys = list(SEARCH_SPACE.keys())
    values = list(SEARCH_SPACE.values())
    combinations = list(itertools.product(*values))

    results: List[Dict[str, Any]] = []

    mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
    mlflow.set_experiment(f"{settings.mlflow_experiment_name}_HpTune")

    for combo in combinations:
        params = dict(zip(keys, combo))
        logger.info(f"[HpTune] Running: {params}")

        try:
            with mlflow.start_run(run_name=f"hptune_{params['architecture']}_lr{params['lr']}") as run:
                mlflow.log_params(params)
                train_cnn(
                    architecture=params["architecture"],
                    epochs=params["epochs"],
                    lr=params["lr"],
                    run_name=run.info.run_id,
                )
                # Fetch best val_acc logged during training
                run_data = mlflow.get_run(run.info.run_id).data
                best_val_acc = run_data.metrics.get("best_val_acc", 0.0)
                results.append({**params, "best_val_acc": best_val_acc, "run_id": run.info.run_id})
        except Exception as exc:
            logger.error(f"[HpTune] Run failed for {params}: {exc}")

    results.sort(key=lambda r: r["best_val_acc"], reverse=True)
    logger.info(f"[HpTune] Best config: {results[0] if results else 'N/A'}")
    return results