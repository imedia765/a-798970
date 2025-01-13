import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

const UserManual = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: currentManual, isLoading } = useQuery({
    queryKey: ['current-manual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentation')
        .select('*')
        .eq('is_current', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-manual');
      
      if (error) throw error;

      // Open the manual in a new tab
      window.open(data.url, '_blank');

      toast({
        title: "Success",
        description: "User manual generated successfully",
      });
    } catch (error) {
      console.error('Error downloading manual:', error);
      toast({
        title: "Error",
        description: "Failed to generate user manual",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-dashboard-accent1" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">User Manual</h2>
          {currentManual ? (
            <p className="text-sm text-dashboard-muted">
              Version {currentManual.version} • Last updated: {new Date(currentManual.updated_at).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-dashboard-muted">No manual version available</p>
          )}
        </div>
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              {currentManual ? 'Download Manual' : 'Generate Manual'}
            </>
          )}
        </Button>
      </div>

      <div className="bg-dashboard-card border border-dashboard-cardBorder rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Manual Contents</h3>
        <div className="space-y-2">
          <p className="text-dashboard-text">• Getting Started - Login process and initial setup</p>
          <p className="text-dashboard-text">• Member Features - Profile management and payments</p>
          <p className="text-dashboard-text">• Collector Features - Member management and collections</p>
          <p className="text-dashboard-text">• Admin Features - System management and monitoring</p>
          <p className="text-dashboard-text">• Common Tasks - Step-by-step guides</p>
          <p className="text-dashboard-text">• Troubleshooting - Common issues and solutions</p>
        </div>
      </div>
    </div>
  );
};

export default UserManual;