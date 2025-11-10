"use client";

interface CollectionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  collectionTitle: string;
}

export default function CollectionViewModal({ 
  isOpen, 
  onClose, 
  collectionId, 
  collectionTitle 
}: CollectionViewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{collectionTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="text-gray-600">
          <p>Collection ID: {collectionId}</p>
          <p className="mt-4">Modal content will go here...</p>
        </div>
      </div>
    </div>
  );
}
