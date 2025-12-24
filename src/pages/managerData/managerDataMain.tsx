import React, { useEffect, useState } from 'react';
import { FileText, DollarSign, CreditCard, ClipboardList, Tag, PieChart, FileCheck, Users } from 'lucide-react';
import type { Office, DataCard } from '../../interface/ManagerAnalisesModel';
import { getManagerModelData, getOfficeList } from '../../services/managerService';
import InvoicesModal from './billDataModel';
import IntakeModal from './intakeDataModel';
import ContractorPaymentModal from './contractorPaymentDataModel';
import DebtorsModal from './deptorDataModel';
import ProposalModal from './proposalDataModel';
import ProjectModal from './projectDataModel';
import FinancialSummaryModal from './dashboardSummary';
import ProjectAnalysesDashboard from './ProjectDataAnalyses';





const managerDataMain: React.FC = () => {
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isDeptorModalOpen, setIsDeptorModalOpen] = useState(false);
  const [isContractorModalOpen, setIsContractorModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isFinancialSummaryModalOpen, setIsFinancialSummaryModalOpen] = useState(false);
  const [isProjectAnalysisModalOpen, setIsProjectAnalysisModalOpen] = useState(false);

  const [dataModel, setDataModel] = useState<any>(null);
  const dataCards: DataCard[] = [
    {
      title: 'חשבונות',
      icon: <FileText className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetBillsDataAsync'

    },

    {
      title: 'תקבולים',
      icon: <DollarSign className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetIntakesDataAsync'

    },

    {
      title: 'חשבונות חיוביים',
      icon: <CreditCard className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetDeptorsDataAsync'
    },

    {
      title: 'פרויקטים חדשים והגדלות',
      icon: <ClipboardList className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetProjectsDataAsync'
    },

    {
      title: 'פילוח פרויקטים',
      icon: <PieChart className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetProjectAnalysesByOfficeAsync'
    },

    {
      title: 'הצעות מחיר',
      icon: <Tag className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetProposalsDataAsync'
    },

    {
      title: 'תשלומים לקבלני משנה',
      icon: <FileCheck className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetContractorPaymentDataAsync'
    },

    {
      title: 'ריכוז נתונים',
      icon: <Users className="w-12 h-12 text-blue-300" />,
      available: false,
      function: 'GetFinancialSummaryAsync'
    }
  ];

  const [selectedOffice, setSelectedOffice] = useState<Office>({ id: 0, name: '' });
  const [offices, setOffices] = useState<Office[]>([]);
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const data = await getOfficeList();
        setSelectedOffice(data[0] || { id: 0, name: '' });
        setOffices(data);
      } catch (error) {
        console.error('Error loading offices:', error);
      }

    };

    fetchOffices();
  }, []);
  const setModelOpen = (functionName: string) => {
    switch (functionName) {
      case 'GetBillsDataAsync':
        setIsBillModalOpen(true);
        break;
      case 'GetIntakesDataAsync':
        setIsIntakeModalOpen(true);
        break;
      case 'GetDeptorsDataAsync':
        setIsDeptorModalOpen(true);
        break;
      case 'GetContractorPaymentDataAsync':
        setIsContractorModalOpen(true);
        break;
      case 'GetProjectsDataAsync':
        setIsProjectModalOpen(true);
        break;
      case 'GetProposalsDataAsync':
        setIsProposalModalOpen(true);
        break;
      case 'GetFinancialSummaryAsync':
        setIsFinancialSummaryModalOpen(true);
        break;
      case 'GetProjectAnalysesByOfficeAsync':
        setIsProjectAnalysisModalOpen(true);
        break;
      default:
        break;
    }
  };
  const openModal = async (functionName: string) => {
    const data = await getManagerModelData(selectedOffice.id, functionName);
    setDataModel(data);
    setModelOpen(functionName);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4">
      {/* Office Selection */}

      <div className="flex justify-center mb-2 ">
        <div className="w-2/3 sm:w-1/2 md:w-1/3 lg:w-1/4">
          <div className="text-right bg-white border-2 border-purple-300 rounded-xl shadow-sm mb-2">
            <select
              dir="rtl"
              value={selectedOffice.id}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const office = offices.find((o) => o.id === selectedId);
                if (office) {
                  setSelectedOffice({ id: office.id, name: office.name });
                }
              }}
              className="text-gray-800 w-full  px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">בחר משרד...</option>
              {offices.map(office => (
                <option
                  //className=" text-sm text-gray-700 bg-white hover:bg-purple-100" 
                  key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {dataCards.map((card, index) => (
            <button
              key={index}
              onClick={() => openModal(card.function!)}
              className="bg-white rounded-2xl shadow-lg p-3 flex flex-col min-h-[180px] hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="mb-4 flex items-center justify-center">
              {card.icon}
              </div>
              <div className="flex-1 flex items-center justify-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                {card.title}
              </h3>
              </div>
            </button>
            ))}
        </div>
        {isBillModalOpen && dataModel && (
          <InvoicesModal
            isOpen={isBillModalOpen}
            onClose={() => setIsBillModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />

        )}
        {isIntakeModalOpen && dataModel && (
          <IntakeModal
            isOpen={isIntakeModalOpen}
            onClose={() => setIsIntakeModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
        {isContractorModalOpen && dataModel && (
          <ContractorPaymentModal
            isOpen={isContractorModalOpen}
            onClose={() => setIsContractorModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
        {isDeptorModalOpen && dataModel && (
          <DebtorsModal
            isOpen={isDeptorModalOpen}
            onClose={() => setIsDeptorModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
        {isProposalModalOpen && dataModel && (
          <ProposalModal
            isOpen={isProposalModalOpen}
            onClose={() => setIsProposalModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
        {isProjectModalOpen && dataModel && (
          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
        {isFinancialSummaryModalOpen && dataModel && (
          <FinancialSummaryModal
            isOpen={isFinancialSummaryModalOpen}
            onClose={() => setIsFinancialSummaryModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
        {isProjectAnalysisModalOpen && dataModel && (
          <ProjectAnalysesDashboard
            isOpen={isProjectAnalysisModalOpen}
            onClose={() => setIsProjectAnalysisModalOpen(false)}
            managerDataCard={dataModel}
            officeName={selectedOffice.name}
          />
        )}
      </div>

    </div>
  );
};

export default managerDataMain;