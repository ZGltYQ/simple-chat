import ClearIcon from '@mui/icons-material/Clear';

export default function PreviewImage({ src, onRemove }: { src: string, onRemove?: () => void }) {
    return (
        <div style={{
            position: 'relative',
            width: 100,
            height: 100,
            marginBottom: 10,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            border: '1px solid #ddd',
        }}>
            <img
                src={src}
                alt="Preview"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
            <ClearIcon
                style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: 18,
                    padding: 2,
                    transition: 'background-color 0.3s',
                }}
                onClick={onRemove}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)' }}
            />
        </div>
    )
}