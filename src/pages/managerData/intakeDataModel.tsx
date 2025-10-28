import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ManagerAnalises, ManagerCardModalProps, ManagerIntakeList } from '../../interface/interfaces';




const IntakeModal: React.FC<ManagerCardModalProps> = ({ isOpen, onClose, managerDataCard, officeName }) => {
    const [managerAnalises, setManagerAnalises] = useState<ManagerAnalises | null>(null);
    const [managerIntakesList, setManagerIntakesList] = useState<ManagerIntakeList[]>([]);

    if (!isOpen) return null;

    useEffect(() => {
        if (managerDataCard) {
            setManagerAnalises(managerDataCard.managerAnalises ?? null);
            setManagerIntakesList(managerDataCard.managerIntakesList ?? []);
        } else {
            setManagerAnalises(null);
            setManagerIntakesList([]);
        }
    }, [managerDataCard]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-color-gray-800" dir="rtl">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 text-center">תקבולים-{officeName}</h2>
                    <button
                        onClick={() => onClose()}
                        className="absolute left-0 w-8 h-8 flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                        <p className="text-sm text-gray-500 mb-2">סה״כ לחודש זה</p>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            ₪{managerAnalises ? managerAnalises.month.toLocaleString() : '0'}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                            <p className="text-sm text-gray-500 mb-2">סה״כ לשנה הנוכחית</p>
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                ₪{managerAnalises ? managerAnalises.year.toLocaleString() : '0'}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-right shadow-md hover:shadow-lg transition">
                            <p className="text-sm text-gray-500 mb-2">סה״כ לשנה שעברה</p>
                            <div className="text-2xl font-bold text-gray-800 mb-1">
                                ₪{managerAnalises ? managerAnalises.lastYear.toLocaleString() : '0'}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-right text-sm text-gray-600 mb-3">תקבולים אחרונים</label>
                        <div className="space-y-3">
                            {managerIntakesList.map((intake) => (
                                <div
                                    //key={intake.id}
                                    className="bg-white  border border-gray-300 rounded-xl p-4 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all"
                                >
                                    <div className="flex justify-between mb-2">

                                        <div className="text-sm text-right font-bold text-gray-800">
                                            {intake.projectName}, {intake.projectNum}
                                        </div>
                                        <div className="text-xs text-gray-500">{intake.intakeDate}</div>

                                    </div>
                                    <div className="text-sm text-gray-600 text-right">
                                        ₪{(intake.sum ?? 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600 text-right">
                                        {intake.customerName}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default IntakeModal;