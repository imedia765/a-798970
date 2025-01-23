import { Member } from "@/types/member";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import MemberCard from '../MemberCard';
import PaginationControls from '../../ui/pagination/PaginationControls';
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import EditProfileDialog from "../EditProfileDialog";

interface MembersListContentProps {
  members: Member[];
  isLoading: boolean;
  userRole: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MembersListContent = ({
  members,
  isLoading,
  userRole,
  currentPage,
  totalPages,
  onPageChange,
}: MembersListContentProps) => {
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setShowEditDialog(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member deleted",
        description: "Member has been successfully deleted",
      });

      // Refresh the page to update the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdated = () => {
    setShowEditDialog(false);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(100vh-16rem)] w-full rounded-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-dashboard-accent1" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4 px-1">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                userRole={userRole}
                onEditClick={() => handleEditClick(member)}
                onDeleteClick={() => handleDeleteMember(member.id)}
              />
            ))}
          </Accordion>
        )}
      </ScrollArea>
      
      {!isLoading && members.length > 0 && totalPages > 1 && (
        <div className="py-4 overflow-x-auto">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {selectedMember && (
        <EditProfileDialog
          member={selectedMember}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default MembersListContent;