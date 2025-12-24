import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ManagerBillList, ManagerCardModalProps } from '../../interface/ManagerAnalisesModel';



const DebtorsModal: React.FC<ManagerCardModalProps> = ({ isOpen, onClose, managerDataCard, officeName }) => {
    const [managerDebtorsList, setManagerDebtorsList] = useState<ManagerBillList[]>([]);

    if (!isOpen) return null;

    useEffect(() => {
        if (managerDataCard) {
            setManagerDebtorsList(managerDataCard.managerDeptorsList ?? []);
        } else {
            setManagerDebtorsList([]);
        }
    }, [managerDataCard]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-gray-800" dir="rtl">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2 ">
                    <h2 className="text-lg font-semibold text-gray-800 text-center">חשבונות חייבים ומאושרים- <br />{officeName}</h2>
                    <button
                        onClick={() => onClose()}
                        className="absolute left-0 w-8 h-8 flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                            <p className="text-sm text-gray-500 mb-2">סה"כ חשבונות חייבים</p>
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                ₪{managerDataCard ? managerDataCard.allDebtors.toLocaleString() : '0'}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                            <p className="text-sm text-gray-500 mb-2">סה"כ חשבונות מאושרים</p>
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                ₪{managerDataCard ? managerDataCard.approvedDebtors.toLocaleString() : '0'}
                            </div>
                        </div>
                    </div>



                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                            <p className="text-sm text-gray-500 mb-2">סה״כ לשנה הנוכחית</p>
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                ₪{managerDataCard ? managerDataCard.year.toLocaleString() : '0'}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                            <p className="text-sm text-gray-500 mb-2">סה״כ משנים קודמות</p>
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                ₪{managerDataCard ? managerDataCard.lastYear.toLocaleString() : '0'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-right text-sm text-gray-600 mb-3">חייבים אחרונים</label>
                        <div className="space-y-3">
                            {managerDebtorsList.map((debtor) => (
                                <div
                                    key={debtor.id}
                                    className="bg-white border border-gray-300 rounded-xl p-4 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all"
                                >
                                    <div className="flex justify-between mb-2">
                                        <div className="text-sm text-right font-bold text-gray-800">
                                            {debtor.projectName}, {debtor.projectNum}
                                        </div>
                                        <div className="text-xs text-gray-500">{debtor.billDate}</div>
                                    </div>

                                    <div className="text-sm text-gray-600 text-right">
                                        סכום: ₪{(debtor.sum ?? 0).toLocaleString()},  סטטוס: {debtor.statusName},  שולם:  ₪{(debtor.payment ?? 0).toLocaleString()}
                                    </div>

                                    <div className="text-sm text-gray-600 text-right">
                                        {debtor.customerName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default DebtorsModal;