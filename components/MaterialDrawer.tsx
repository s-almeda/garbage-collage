"use client";

import { useState } from "react";
import Collection from "./Collection";
import CollectionViewModal from "./CollectionViewModal";
import { Plus } from "lucide-react";

export default function MaterialDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; title: string } | null>(null);

  // Mock collections data
  const mockCollections = [
    { id: "1", title: "MIDJOURNEY2025", subtitle: "added by shm", coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400" },
    { id: "2", title: "DESIGN INSPO", subtitle: "added by shm", coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400" },
    { id: "3", title: "RECIPES", subtitle: "added by shm" },
  ];

  const handleCollectionClick = (id: string, title: string) => {
    setSelectedCollection({ id, title });
  };

  const handleAddCollection = () => {
    console.log("Add new collection clicked");
    // Will implement later
  };

  return (
    <>
      <div 
        className={`absolute left-0 top-0 h-full z-25 flex items-center transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-[220px]"
        }`}
      >
        {/* Drawer panel */}
        <div
          className="h-full bg-slate-700 border-r-4 border-t-4 border-b-4 border-slate-900 flex flex-col"
          style={{ width: "220px" }}
        >
          {/* Scrollable collections area */}
          <div className="flex-1 overflow-y-auto p-3">
            <h2 className="text-lg font-bold text-white mb-3 text-center">Collections</h2>
            <div className="space-y-2">
              {mockCollections.map((collection) => (
                <Collection
                  key={collection.id}
                  id={collection.id}
                  title={collection.title}
                  subtitle={collection.subtitle}
                  coverImage={collection.coverImage}
                  onClick={() => handleCollectionClick(collection.id, collection.title)}
                />
              ))}
            </div>
          </div>

          {/* Add button at bottom */}
          <div className="p-3 border-t-2 border-slate-800">
            <button
              onClick={handleAddCollection}
              className="w-full py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span className="font-semibold text-sm">Add Collection</span>
            </button>
          </div>
        </div>

        {/* Handle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 border-2 border-slate-600 rounded-r-lg shadow-lg hover:from-slate-400 hover:via-slate-500 hover:to-slate-600 transition-colors flex items-center justify-center"
          style={{ width: "40px", height: "120px" }}
        >
          <div className="flex flex-col gap-1">
            <div className="w-6 h-1 bg-slate-700 rounded"></div>
            <div className="w-6 h-1 bg-slate-700 rounded"></div>
            <div className="w-6 h-1 bg-slate-700 rounded"></div>
          </div>
        </button>
      </div>

      {/* Collection View Modal */}
      {selectedCollection && (
        <CollectionViewModal
          isOpen={!!selectedCollection}
          onClose={() => setSelectedCollection(null)}
          collectionId={selectedCollection.id}
          collectionTitle={selectedCollection.title}
        />
      )}
    </>
  );
}
