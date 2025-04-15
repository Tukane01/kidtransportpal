
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ChildForm from "@/components/ChildForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

type Child = {
  id: string;
  name: string;
  surname: string;
  schoolName: string;
  schoolAddress: string;
  idNumber?: string;
};

const ChildrenSection: React.FC = () => {
  const { user, refreshProfile } = useSupabaseAuth();
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [showEditChildDialog, setShowEditChildDialog] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [childToEdit, setChildToEdit] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoadingChildren(true);
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user?.id);
          
        if (error) throw error;
        
        // Transform from snake_case to camelCase
        const formattedChildren = data.map(child => ({
          id: child.id,
          name: child.name,
          surname: child.surname,
          schoolName: child.school_name,
          schoolAddress: child.school_address,
          idNumber: child.id_number
        }));
        
        setChildren(formattedChildren);
      } catch (error) {
        console.error('Error fetching children:', error);
        toast.error('Failed to load children');
      } finally {
        setIsLoadingChildren(false);
      }
    };
    
    if (user) {
      fetchChildren();
    }
  }, [user]);
  
  const handleDeleteChild = async () => {
    if (!childToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childToDelete.id);
        
      if (error) throw error;
      
      setChildren(prev => prev.filter(child => child.id !== childToDelete.id));
      setChildToDelete(null);
      toast.success("Child removed successfully");
    } catch (error) {
      console.error("Error deleting child:", error);
      toast.error("Failed to delete child");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleAddChildComplete = () => {
    setShowAddChildDialog(false);
    refreshProfile(true); // Refresh to get updated children
    toast.success("Child added successfully");
  };

  const handleEditChildComplete = () => {
    setShowEditChildDialog(false);
    setChildToEdit(null);
    refreshProfile(true); // Refresh to get updated children
    toast.success("Child updated successfully");
  };

  const handleEditChild = (child: Child) => {
    setChildToEdit(child);
    setShowEditChildDialog(true);
  };
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900">Children</CardTitle>
          <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
            <DialogTrigger asChild>
              <Button className="bg-schoolride-primary hover:bg-schoolride-secondary text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Child
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-gray-900">Add Child</DialogTitle>
                <DialogDescription className="text-gray-700">
                  Add your child's details to request rides for them
                </DialogDescription>
              </DialogHeader>
              <ChildForm 
                onComplete={handleAddChildComplete} 
                onCancel={() => setShowAddChildDialog(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingChildren ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-schoolride-primary" />
          </div>
        ) : children && children.length > 0 ? (
          <div className="space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="border rounded-md p-4 bg-gray-50 flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {child.name} {child.surname}
                  </div>
                  <div className="text-sm text-gray-700">ID: {child.idNumber || "Not provided"}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    School: {child.schoolName}
                  </div>
                  <div className="text-sm text-gray-700">
                    Address: {child.schoolAddress}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                    onClick={() => handleEditChild(child)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                        onClick={() => setChildToDelete(child)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5" />
                          Delete Child
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {child.name} {child.surname}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteChild}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-700">No children added yet</p>
            <Button 
              variant="link" 
              className="text-schoolride-primary"
              onClick={() => setShowAddChildDialog(true)}
            >
              Add your first child
            </Button>
          </div>
        )}
      </CardContent>

      {/* Edit Child Dialog */}
      <Dialog open={showEditChildDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditChildDialog(false);
          setChildToEdit(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Child</DialogTitle>
            <DialogDescription className="text-gray-700">
              Update your child's details
            </DialogDescription>
          </DialogHeader>
          {childToEdit && (
            <ChildForm 
              onComplete={handleEditChildComplete} 
              onCancel={() => {
                setShowEditChildDialog(false);
                setChildToEdit(null);
              }}
              existingChild={{
                name: childToEdit.name,
                surname: childToEdit.surname,
                schoolName: childToEdit.schoolName,
                schoolAddress: childToEdit.schoolAddress,
                idNumber: childToEdit.idNumber || "",
                id: childToEdit.id
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChildrenSection;
