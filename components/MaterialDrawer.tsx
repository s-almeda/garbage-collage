"use client";

import { useState } from "react";
import Collection from "./Collection";
import CollectionViewModal from "./CollectionViewModal";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getImageUrl } from "@/lib/api/collections";

export default function MaterialDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; title: string } | null>(null);
  const { collections, isLoadingCollections, currentUser } = useApp();

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
          className="h-full bg-neutral-800 border-r-4 border-t-4 border-b-4 border-neutral-700 flex flex-col"
          style={{ width: "220px" }}
        >
          {/* Scrollable collections area */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {isLoadingCollections ? (
                <div className="text-center text-neutral-300 py-4">Loading...</div>
              ) : !Array.isArray(collections) || collections.length === 0 ? (
                <div className="text-center text-neutral-400 py-4 text-sm">No collections yet</div>
              ) : (
                collections.map((collection) => (
                  <Collection
                    key={collection.uid}
                    id={collection.uid}
                    title={collection.name}
                    subtitle={`added by ${collection.user_name}`}
                    coverImage={collection.cover_image ? getImageUrl(collection.cover_image) : undefined}
                    onClick={() => handleCollectionClick(collection.uid, collection.name)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Add button at bottom */}
          <div className="p-3 border-t-2 border-neutral-800">
            <button
              onClick={handleAddCollection}
              className="w-full py-2.5 bg-neutral-600 hover:bg-slate-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span className="font-semibold text-sm">Add Collection</span>
            </button>
          </div>
        </div>

        {/* Handle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-b from-neutral-300 via-neutral-400 to-neutral-500 border-2 border-black/30 rounded-r-sm shadow-lg hover:from-neutral-400 hover:via-neutral-500 hover:to-neutral-600 transition-colors flex items-center justify-center"
          style={{ width: "40px", height: "120px" }}
        >
          <div className="flex flex-col gap-1">
            <div className="w-6 h-1 bg-black/50"></div>
            <div className="w-6 h-1 bg-black/50"></div>
            <div className="w-6 h-1 bg-black/50"></div>
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
