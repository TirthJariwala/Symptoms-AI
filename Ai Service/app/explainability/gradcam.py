import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional

from app.core.logger import logger


class GradCAM:
    def __init__(self, model: nn.Module, target_layer: nn.Module) -> None:
        self.model = model
        self.target_layer = target_layer
        self._activations: Optional[torch.Tensor] = None
        self._gradients: Optional[torch.Tensor] = None
        self._handles: list = []
        self._register_hooks()

    def _register_hooks(self) -> None:
        def _fwd_hook(module, input, output):
            self._activations = output.detach()

        def _bwd_hook(module, grad_input, grad_output):
            # FIX: do NOT call .detach() here — detaching drops the gradient
            # reference before we can read it, so _gradients was always None.
            self._gradients = grad_output[0]

        fwd_handle = self.target_layer.register_forward_hook(_fwd_hook)
        bwd_handle = self.target_layer.register_full_backward_hook(_bwd_hook)

        # FIX: store handles so we can cleanly remove them in remove_hooks()
        # instead of directly mutating private PyTorch dicts (brittle across versions).
        self._handles = [fwd_handle, bwd_handle]

    def generate(
        self, image_tensor: torch.Tensor, target_class: Optional[int] = None
    ) -> np.ndarray:
        """
        Full forward + backward in one call.
        NOTE: do NOT call this after pipeline.predict() — that runs under
        @torch.no_grad() and blocks the backward pass. Use
        generate_from_logits() with pipeline.forward_with_gradients() instead.
        """
        self.model.eval()
        image_tensor.requires_grad_(True)
        logits, _ = self.model(image_tensor)

        if target_class is None:
            target_class = int(logits.argmax(dim=1).item())

        return self._backward_and_build(logits, image_tensor, target_class)

    def generate_from_logits(
        self,
        logits: torch.Tensor,
        image_tensor: torch.Tensor,
        target_class: Optional[int] = None,
    ) -> np.ndarray:
        """
        Backward pass only — use when the caller has already done a forward
        pass with gradients enabled (e.g. via pipeline.forward_with_gradients).
        Avoids a redundant forward pass and works correctly alongside
        @torch.no_grad()-decorated predict() methods.
        """
        if target_class is None:
            target_class = int(logits.argmax(dim=1).item())

        return self._backward_and_build(logits, image_tensor, target_class)

    def _backward_and_build(
        self,
        logits: torch.Tensor,
        image_tensor: torch.Tensor,
        target_class: int,
    ) -> np.ndarray:
        self.model.zero_grad()
        logits[0, target_class].backward()

        if self._activations is None or self._gradients is None:
            logger.warning("Grad-CAM: activations or gradients not captured.")
            h, w = image_tensor.shape[2], image_tensor.shape[3]
            return np.zeros((h, w), dtype=np.float32)

        # Global average pool the gradients -> channel weights
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)

        # Weighted sum of activations
        cam = (weights * self._activations).sum(dim=1, keepdim=True)  # (1, 1, h, w)
        cam = F.relu(cam)

        # Upsample to input image size
        h, w = image_tensor.shape[2], image_tensor.shape[3]
        cam = F.interpolate(cam, size=(h, w), mode="bilinear", align_corners=False)
        cam = cam.squeeze().cpu().numpy()  # (H, W)

        # Normalise to [0, 1]
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        return cam.astype(np.float32)

    def remove_hooks(self) -> None:
        # FIX: use the stored handles for clean removal instead of
        # clearing private PyTorch hook dicts directly.
        for handle in self._handles:
            handle.remove()
        self._handles = []