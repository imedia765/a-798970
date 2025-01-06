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
        <h1 className="text-3xl font-medium mb-2 text-white">Financial & Collector Management</h1>
        <p className="text-dashboard-text">Manage payments and collector assignments</p>
      </header>

      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-dashboard-accent1/20 to-dashboard-accent1/5 border-dashboard-accent1/30 p-4">
            <TotalCount
              items={[{
                count: totals.totalCollected,
                label: "Total Amount Collected (£)",
                icon: <Wallet className="h-5 w-5 text-dashboard-accent1" />
              }]}
            />
          </Card>
          
          <Card className="bg-gradient-to-br from-dashboard-accent2/20 to-dashboard-accent2/5 border-dashboard-accent2/30 p-4">
            <TotalCount
              items={[{
                count: totals.pendingAmount,
                label: "Pending Amount (£)",
                icon: <Receipt className="h-5 w-5 text-dashboard-accent2" />
              }]}
            />
          </Card>
          
          <Card className="bg-gradient-to-br from-dashboard-accent3/20 to-dashboard-accent3/5 border-dashboard-accent3/30 p-4">
            <TotalCount
              items={[{
                count: totals.totalCollectors,
                label: "Active Collectors",
                icon: <Users className="h-5 w-5 text-dashboard-accent3" />
              }]}
            />
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30 p-4">
            <TotalCount
              items={[{
                count: totals.totalTransactions,
                label: "Total Transactions",
                icon: <Receipt className="h-5 w-5 text-purple-500" />
              }]}
            />
          </Card>
        </div>
      )}

      <Card className="bg-dashboard-card border-dashboard-accent1/20">
        <Tabs defaultValue="overview" className="p-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 gap-4 bg-dashboard-dark">
            <TabsTrigger value="overview">Payment Overview</TabsTrigger>
            <TabsTrigger value="collectors">Collectors Overview</TabsTrigger>
            <TabsTrigger value="payments">All Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <PaymentStatistics />
          </TabsContent>

          <TabsContent value="collectors" className="mt-6">
            <div className="space-y-8">
              <CollectorsList />
              <CollectorsSummary />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <AllPaymentsTable showHistory={true} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CollectorFinancialsView;