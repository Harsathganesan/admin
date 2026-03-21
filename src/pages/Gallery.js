import React, { useRef } from 'react';
import { Upload, Trash2, Plus, ExternalLink, Download } from 'lucide-react';

const Gallery = ({ images, setImages }) => {
  const fileInputRef = useRef(null);

  const handleDelete = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local object URL for instant preview
      const imageUrl = URL.createObjectURL(file);
      
      const newImage = {
        id: Date.now(), // Generate a unique ID based on timestamp
        url: imageUrl,
        title: file.name.split('.')[0] || 'New Artwork', // Default title from filename
        category: 'New'
      };

      // Add to state
      setImages([newImage, ...images]);
    }
    
    // Reset file input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleDownload = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="gallery-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Art Gallery</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your portfolio and drawing samples.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleUploadClick}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} />
          Add New Artwork
        </button>
      </div>

      {/* Stats for Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{images.length}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Artworks</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>2</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Categories</p>
        </div>
      </div>

      {/* Grid of Images */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {images.map((img) => (
          <div key={img.id} className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative', group: 'true' }}>
            <img 
              src={img.url} 
              alt={img.title} 
              style={{ width: '100%', height: '240px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{img.title}</h3>
                <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>{img.category}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0.5rem' }}
                  onClick={() => handleDownload(img.url, img.title)}
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0.5rem' }}
                  onClick={() => window.open(img.url, '_blank')}
                  title="Open"
                >
                  <ExternalLink size={16} />
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '0.5rem', color: '#ef4444', borderColor: '#fee2e2' }}
                  onClick={() => handleDelete(img.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Placeholder */}
        <div 
          onClick={handleUploadClick}
          style={{ 
            border: '2px dashed var(--border)', 
            borderRadius: 'var(--radius)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '350px',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Upload size={32} color="var(--primary)" />
          </div>
          <p style={{ fontWeight: 600 }}>Click to Upload</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG or SVG</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default Gallery;
