import { useRef } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos = [], onChange, label = 'Foto' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange([...photos, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="photo-uploader-container">
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo, idx) => (
            <div key={idx} className="photo-item-wrapper">
              <img src={photo} alt={`${label} ${idx + 1}`} className="photo-preview" />
              <button 
                type="button" 
                onClick={() => removePhoto(idx)} 
                className="photo-remove-btn"
                title="Excluir foto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={triggerUpload} 
            className="photo-add-square-btn"
            title="Adicionar mais fotos"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      {photos.length === 0 && (
        <button 
          type="button" 
          onClick={triggerUpload} 
          className="photo-placeholder-btn"
        >
          <div className="placeholder-content">
            <Camera size={24} className="placeholder-icon" />
            <span className="placeholder-text">Adicionar Foto do Trabalho</span>
          </div>
        </button>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        multiple
        style={{ display: 'none' }} 
      />
    </div>
  );
};
export default PhotoUploader;
