"use client";

import { useEffect, useState } from "react";
import { getCollection, updateCollectionName } from "@/lib/api/collections";
import { CollectionWithPages } from "@/lib/types/collections";
import { Pencil, Save, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

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
  const [collection, setCollection] = useState<CollectionWithPages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { currentUser } = useApp();

  useEffect(() => {
    if (isOpen && collectionId) {
      const fetchCollection = async () => {
        setIsLoading(true);
        try {
          const data = await getCollection(collectionId);
          console.log("Collection data:", data); // Debug log
          setCollection(data);
          setEditedName(data.name);
          setEditedDescription(data.description || "");
        } catch (error) {
          console.error("Failed to fetch collection:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCollection();
    }
  }, [isOpen, collectionId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (collection) {
      setEditedName(collection.name);
      setEditedDescription(collection.description || "");
    }
  };

  const handleSave = async () => {
    if (!collection) return;
    
    setIsSaving(true);
    try {
      const updatedCollection = await updateCollectionName(collectionId, {
        user_name: currentUser,
        name: editedName,
        description: editedDescription,
      });
      setCollection({ ...collection, ...updatedCollection });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update collection:", error);
      alert("Failed to update collection");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      
      {/* Modal - glass effect with backdrop blur */}
      <div className="grainy relative bg-stone-100 backdrop-blur-md border-2 border-stone-300 shadow-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-stone-800 mb-2 w-full border-2 border-stone-400 rounded px-2 py-1 bg-white"
              />
            ) : (
              <h2 className="text-2xl font-bold text-stone-800 mb-2">{collection?.name || collectionTitle}</h2>
            )}
            {collection && (
              <div className="space-y-2 text-sm text-stone-700">
                <p><span className="font-semibold">Type:</span> {collection.type || 'Unknown'}</p>
                <p><span className="font-semibold">Created by:</span> {collection.user_name || 'Unknown'}</p>
                <p><span className="font-semibold">Created:</span> {collection.created_at ? new Date(collection.created_at.replace(' ', 'T')).toLocaleDateString() : 'Unknown'}</p>
                <p><span className="font-semibold">Pages:</span> {collection.pages?.length || 0}</p>
                {isEditing ? (
                  <div className="mt-3">
                    <p className="font-semibold mb-1">Description:</p>
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full border-2 border-stone-400 rounded px-2 py-1 bg-white text-stone-700 min-h-[80px]"
                    />
                  </div>
                ) : collection.description ? (
                  <p className="mt-3"><span className="font-semibold">Description:</span> {collection.description}</p>
                ) : null}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-green-700 hover:text-green-800 p-2 rounded hover:bg-green-100 disabled:opacity-50"
                  title="Save"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="text-red-700 hover:text-red-800 p-2 rounded hover:bg-red-100 disabled:opacity-50"
                  title="Cancel"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="text-stone-700 hover:text-stone-800 p-2 rounded hover:bg-stone-200"
                title="Edit"
              >
                <Pencil size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-stone-700 hover:text-stone-800 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-8 text-stone-600">Loading collection details...</div>
          ) : collection ? (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-stone-800">Pages</h3>
              <div className="grid grid-cols-3 gap-4">
                {collection.pages && collection.pages.length > 0 ? (
                  collection.pages.map((page, index) => (
                    <div key={page.uid} className="border border-stone-300 rounded p-2 bg-white shadow-sm">
                      {page.type === "image" ? (
                        <img 
                          src={`https://art.snailbunny.site/api/collections/uploads/${page.content}`}
                          alt={`Page ${index + 1}`}
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="bg-stone-50 p-3 rounded min-h-[100px] border border-stone-200">
                          <p className="text-sm text-stone-700">{page.content}</p>
                        </div>
                      )}
                      <p className="text-xs text-stone-600 mt-1">Page {index + 1}</p>
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-center text-stone-600">No pages yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-stone-600">Failed to load collection</div>
          )}
        </div>
      </div>
    </div>
  );
}
