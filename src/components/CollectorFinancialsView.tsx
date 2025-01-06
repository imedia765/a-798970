import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentStatistics from './financials/PaymentStatistics';
import CollectorsSummary from './financials/CollectorsSummary';
import AllPaymentsTable from './financials/AllPaymentsTable';
import CollectorsList from './CollectorsList';
import { Card } from "@/components/ui/card";
import { Wallet, Users, Receipt } from "lucide-react";
import TotalCount from './TotalCount';

const CollectorFinancialsView = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: totals } = useQuery({
    queryKey: ['financial-totals'],
    queryFn: async () => {
      console.log('Fetching financial totals');
      
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_requests')
        .select('amount, status');
      
      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      const { data: collectors, error: collectorsError } = await supabase
        .from('members_collectors')
        .select('*');

      if (collectorsError) {
        console.error('Error fetching collectors:', collectorsError);
        throw collectorsError;
      }

      const totalAmount = payments?.reduce((sum, payment) => 
        payment.status === 'approved' ? sum + Number(payment.amount) : sum, 0
      ) || 0;

      const pendingAmount = payments?.reduce((sum, payment) => 
        payment.status === 'pending' ? sum + Number(payment.amount) : sum, 0
      ) || 0;

      return {
        totalCollected: totalAmount,
        pendingAmount: pendingAmount,
        totalCollectors: collectors?.length || 0,
        totalTransactions: payments?.length || 0
      };
    }
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <header className="mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-1 sm:mb-2 text-white">
          Financial & Collector Management
        </h1>
        <p className="text-xs sm:text-sm text-white/80">
          Manage payments and collector assignments
        </p>
      </header>

      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card className="bg-emerald-500/10 border-emerald-500/20 p-2 sm:p-3 md:p-4 hover:bg-emerald-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalCollected,
                label: "Total Amount Collected (£)",
                icon: <Wallet className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-emerald-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-amber-500/10 border-amber-500/20 p-2 sm:p-3 md:p-4 hover:bg-amber-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.pendingAmount,
                label: "Pending Amount (£)",
                icon: <Receipt className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-amber-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-indigo-500/10 border-indigo-500/20 p-2 sm:p-3 md:p-4 hover:bg-indigo-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalCollectors,
                label: "Active Collectors",
                icon: <Users className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-indigo-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-violet-500/10 border-violet-500/20 p-2 sm:p-3 md:p-4 hover:bg-violet-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalTransactions,
                label: "Total Transactions",
                icon: <Receipt className="h-3.5 sm:h-4 md:h-5 w-3.5 sm:w-4 md:w-5 text-violet-400" />
              }]}
            />
          </Card>
        </div>
      )}

      <Card className="bg-dashboard-card border-white/10">
        <Tabs defaultValue="overview" className="p-2 sm:p-3 md:p-4" onValueChange={setActiveTab}>
          <TabsList className="flex flex-col sm:flex-row w-full gap-1 sm:gap-2 bg-white/5 p-1">
            <TabsTrigger 
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2" 
              value="overview"
            >
              Payment Overview
            </TabsTrigger>
            <TabsTrigger 
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2" 
              value="collectors"
            >
              Collectors Overview
            </TabsTrigger>
            <TabsTrigger 
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2" 
              value="payments"
            >
              All Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-2 sm:mt-3 md:mt-4">
            <PaymentStatistics />
          </TabsContent>

          <TabsContent value="collectors" className="mt-2 sm:mt-3 md:mt-4">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <CollectorsList />
              <CollectorsSummary />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-2 sm:mt-3 md:mt-4">
            <AllPaymentsTable showHistory={true} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CollectorFinancialsView;