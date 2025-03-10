


export default function ImagesWrapper({ images }: { images: string[] }) {
    return images?.length ? (
        <div style={{ marginTop: 10 }}>
          {images.map((image, index) => (
            <img key={index} src={image} alt="Preview" style={{ maxWidth: 100, maxHeight: 100, marginRight: 10 }} />
          ))}
        </div>
    ) : null
}