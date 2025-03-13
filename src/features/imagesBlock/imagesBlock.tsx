import { useStore } from "zustand";
import { chatStore } from "@/app/store";
import ImagesWrapper from "@/shared/ui/imagesWrapper";

export default function ImagesBlock() {
    const images = useStore(chatStore, state => state.images);
    
    return <ImagesWrapper images={images} />;
}