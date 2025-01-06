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
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium mb-2 text-white">Financial & Collector Management</h1>
        <p className="text-sm md:text-base text-white/80">Manage payments and collector assignments</p>
      </header>

      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-emerald-500/10 border-emerald-500/20 p-3 md:p-4 hover:bg-emerald-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalCollected,
                label: "Total Amount Collected (£)",
                icon: <Wallet className="h-5 w-5 text-emerald-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-amber-500/10 border-amber-500/20 p-3 md:p-4 hover:bg-amber-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.pendingAmount,
                label: "Pending Amount (£)",
                icon: <Receipt className="h-5 w-5 text-amber-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-indigo-500/10 border-indigo-500/20 p-3 md:p-4 hover:bg-indigo-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalCollectors,
                label: "Active Collectors",
                icon: <Users className="h-5 w-5 text-indigo-400" />
              }]}
            />
          </Card>
          
          <Card className="bg-violet-500/10 border-violet-500/20 p-3 md:p-4 hover:bg-violet-500/15 transition-colors">
            <TotalCount
              items={[{
                count: totals.totalTransactions,
                label: "Total Transactions",
                icon: <Receipt className="h-5 w-5 text-violet-400" />
              }]}
            />
          </Card>
        </div>
      )}

      <Card className="bg-dashboard-card border-white/10">
        <Tabs defaultValue="overview" className="p-4 md:p-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 bg-white/5">
            <TabsTrigger value="overview">Payment Overview</TabsTrigger>
            <TabsTrigger value="collectors">Collectors Overview</TabsTrigger>
            <TabsTrigger value="payments">All Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 md:mt-6">
            <PaymentStatistics />
          </TabsContent>

          <TabsContent value="collectors" className="mt-4 md:mt-6">
            <div className="space-y-6 md:space-y-8">
              <CollectorsList />
              <CollectorsSummary />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4 md:mt-6">
            <AllPaymentsTable showHistory={true} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CollectorFinancialsView;