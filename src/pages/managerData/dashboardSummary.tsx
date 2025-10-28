import React, { useEffect, useState } from 'react';
import type { ManagerCardModalProps } from '../../interface/interfaces';
import type { FinancialSummary } from '../../interface/interfaces';
import { X } from 'lucide-react';

const FinancialSummaryModal: React.FC<ManagerCardModalProps> = ({
    isOpen,
    onClose,
    managerDataCard,
    officeName
}) => {
    const [data, setData] = useState<FinancialSummary | null>(null);

    if (!isOpen) return null;

    useEffect(() => {
        if (managerDataCard) {
            setData(managerDataCard as FinancialSummary);
        } else {
            setData(null);
        }
    }, [managerDataCard]);



    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);

    //   if (loading) return <div className="text-center p-8 text-gray-600">טוען נתונים...</div>;
    //   if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
    if (!data) return null;

    const cards = [
        {
            title: 'חשבוניות',
            borderColor: 'border-purple-500',
            chartColor: '#9333ea',
            monthAmount: data.billSumMonth,
            yearAmount: data.billSumYear,
            monthCount: data.billCountMonth,
            yearCount: data.billCountYear,
            unpaidAmount: data.debtorSum,
            trend: [data.billSumMonth * 0.7, data.billSumMonth * 0.8, data.billSumMonth],
        },
        {
            title: 'תקבולים',
            borderColor: 'border-green-500',
            chartColor: '#22c55e',
            monthAmount: data.intakeSumMonth,
            yearAmount: data.intakeSumYear,
            monthCount: data.intakeCountMonth,
            yearCount: data.intakeCountYear,
            unpaidAmount: 0,
            trend: [data.intakeSumMonth * 0.7, data.intakeSumMonth * 0.8, data.intakeSumMonth],
        },
        {
            title: 'תשלומים לקבלני משנה',
            borderColor: 'border-blue-500',
            chartColor: '#3b82f6',
            monthAmount: data.contractorPaymentSumMonth,
            yearAmount: data.contractorPaymentSumYear,
            monthCount: data.contractorPaymentCountMonth,
            yearCount: data.contractorPaymentCountYear,
            unpaidAmount: 0,
            trend: [data.contractorPaymentSumMonth * 0.6, data.contractorPaymentSumMonth * 0.9, data.contractorPaymentSumMonth],
        },
        {
            title: 'הצעות מחיר',
            borderColor: 'border-orange-500',
            chartColor: '#f97316',
            monthAmount: data.proposalSumMonth,
            yearAmount: data.proposalSumYear,
            monthCount: data.proposalCountMonth,
            yearCount: data.proposalCountYear,
            unpaidAmount: data.proposalSumActive,
            trend: [data.proposalSumMonth * 0.5, data.proposalSumMonth * 0.9, data.proposalSumMonth],
        },
        {
            title: 'פרויקטים חדשים והגדלות',
            borderColor: 'border-teal-500',
            chartColor: '#14b8a6',
            monthAmount: data.subContractSumMonth,
            yearAmount: data.subContractSumYear,
            monthCount: data.subContractCountMonth,
            yearCount: data.subContractCountYear,
            unpaidAmount: 0,
            trend: [data.subContractSumMonth * 0.6, data.subContractSumMonth * 0.8, data.subContractSumMonth],
        },
    ];

    const calculatePercentage = (part: number, total: number) =>
        total === 0 ? 0 : ((part / total) * 100).toFixed(1);



    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-color-gray-800" dir="rtl">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 text-center">ריכוז נתונים-{officeName}</h2>
                    <button
                        onClick={() => onClose()}
                        className="absolute left-0 w-8 h-8 flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pt-0 p-6 space-y-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1  gap-6">
                        {cards.map((card, i) => {
                            // const chartData = card.trend.map((value) => ({ value }));
                            const percentage = calculatePercentage(card.monthAmount, card.yearAmount);

                            return (
                                <div
                                    key={i}
                                    className={`bg-white rounded-2xl border-r-8 ${card.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-fade-in`}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">{card.title}</h3>

                                    {/* Month */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 font-medium">מתחילת החודש</span>
                                            {card.yearAmount > 0 && (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">
                                                    {percentage}%
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">{formatCurrency(card.monthAmount)}</div>
                                        <div className="text-sm text-gray-600 mt-1">{card.monthCount.toLocaleString('he-IL')} פריטים</div>
                                    </div>

                                    {/* Year */}
                                    <div className="mb-4 pt-4 border-t border-gray-200">
                                        <span className="text-sm text-gray-600 font-medium block mb-2">מתחילת השנה</span>
                                        <div className="text-2xl font-bold text-gray-800">{formatCurrency(card.yearAmount)}</div>
                                        <div className="text-sm text-gray-600 mt-1">{card.yearCount.toLocaleString('he-IL')} פריטים</div>
                                    </div>

                                    {/* Unpaid */}
                                    {card.unpaidAmount > 0 && (
                                        <div className="mb-4 pt-4 border-t border-gray-200">
                                            <span className="text-sm text-red-600 font-medium block mb-2">לא שולם</span>
                                            <div className="text-xl font-bold text-red-600">{formatCurrency(card.unpaidAmount)}</div>
                                        </div>
                                    )}


                                </div>
                            );
                        })}
                    </div>
                </div>
                <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
            </div>
        </div>
    );
};



export default FinancialSummaryModal;