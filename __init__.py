from nodes import SaveImage

class ComfyUI_SaveImageWithoutMetadata(SaveImage):
    @classmethod
    def INPUT_TYPES(s):
        return SaveImage.INPUT_TYPES()

    FUNCTION = "save_images_without_meta"

    def save_images_without_meta(self, images, filename_prefix="ComfyUI", **kwargs):
        kwargs = kwargs.copy()
        kwargs["prompt"] = None
        kwargs["extra_pnginfo"] = None

        return self.save_images(images, filename_prefix, **kwargs)

NODE_CLASS_MAPPINGS = {"ComfyUI_SaveImageWithoutMetadata": ComfyUI_SaveImageWithoutMetadata}
NODE_DISPLAY_NAME_MAPPINGS = {"ComfyUI_SaveImageWithoutMetadata": "Save Image Without Metadata"}
WEB_DIRECTORY = "./js"