import { useStore } from "zustand";
import { chatStore } from "@/app/store";
import PreviewImage from "@/shared/ui/previewImage";

export default function ImagesBlock() {
    const images = useStore(chatStore, state => state.images);
    const setImages = useStore(chatStore, state => state.setImages);

    return (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', columnGap: 10 }}>
            {images.map((image, index) => (
                <PreviewImage key={index} onRemove={() => setImages(images.filter((_, i) => i !== index))} src={image} />
            ))}
        </div>
    )
}