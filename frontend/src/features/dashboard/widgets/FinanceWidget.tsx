import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';

export function FinanceWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">R$ 12.450,00</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          +2.5% este mês
        </p>
        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[70%]" />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">70% da meta</p>
      </CardContent>
    </Card>
  );
}
