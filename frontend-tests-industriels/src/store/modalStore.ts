import { create } from 'zustand';

interface ModalState {
    isTestModalOpen: boolean;
    isNcModalOpen: boolean;
    isNcEditModalOpen: boolean;
    isReportModalOpen: boolean;
    isUserModalOpen: boolean;
    isExecutionModalOpen: boolean;
    isEquipementEditModalOpen: boolean;
    isEquipementCreateModalOpen: boolean;
    isEquipementDetailsModalOpen: boolean;
    isInstrumentCreateModalOpen: boolean;
    isInstrumentDetailsModalOpen: boolean;
    isTypeTestModalOpen: boolean;
    selectedUser: any | null;
    selectedTestId: string | null;
    selectedNcId: string | null;
    selectedEquipementId: string | null;
    selectedInstrumentId: string | null;
    selectedTypeTestId: string | null;
    openTestModal: (testId?: string) => void;
    closeTestModal: () => void;
    openNcModal: () => void;
    closeNcModal: () => void;
    openNcEditModal: (ncId: string) => void;
    closeNcEditModal: () => void;
    openReportModal: () => void;
    closeReportModal: () => void;
    openUserModal: (user?: any) => void;
    closeUserModal: () => void;
    openExecutionModal: (testId: string) => void;
    closeExecutionModal: () => void;
    openEquipementEditModal: (equipementId: string) => void;
    closeEquipementEditModal: () => void;
    openEquipementCreateModal: () => void;
    closeEquipementCreateModal: () => void;
    openEquipementDetailsModal: (equipementId: string) => void;
    closeEquipementDetailsModal: () => void;
    openInstrumentCreateModal: () => void;
    closeInstrumentCreateModal: () => void;
    openInstrumentDetailsModal: (id: string) => void; // Added
    closeInstrumentDetailsModal: () => void; // Added
    openTypeTestModal: (typeTestId?: string) => void;
    closeTypeTestModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isTestModalOpen: false,
    isNcModalOpen: false,
    isNcEditModalOpen: false,
    isReportModalOpen: false,
    isUserModalOpen: false,
    isExecutionModalOpen: false,
    isEquipementEditModalOpen: false,
    isEquipementCreateModalOpen: false,
    isEquipementDetailsModalOpen: false,
    isInstrumentCreateModalOpen: false,
    isInstrumentDetailsModalOpen: false, // Added
    isTypeTestModalOpen: false,
    selectedUser: null,
    selectedTestId: null,
    selectedNcId: null,
    selectedEquipementId: null,
    selectedInstrumentId: null, // Added
    selectedTypeTestId: null,
    openTestModal: (testId?: string) => set({ isTestModalOpen: true, selectedTestId: testId || null }),
    closeTestModal: () => set({ isTestModalOpen: false, selectedTestId: null }),
    openNcModal: () => set({ isNcModalOpen: true }),
    closeNcModal: () => set({ isNcModalOpen: false }),
    openNcEditModal: (ncId) => set({ isNcEditModalOpen: true, selectedNcId: ncId }),
    closeNcEditModal: () => set({ isNcEditModalOpen: false, selectedNcId: null }),
    openReportModal: () => set({ isReportModalOpen: true }),
    closeReportModal: () => set({ isReportModalOpen: false }),
    openUserModal: (user = null) => set({ isUserModalOpen: true, selectedUser: user }),
    closeUserModal: () => set({ isUserModalOpen: false, selectedUser: null }),
    openExecutionModal: (testId) => set({ isExecutionModalOpen: true, selectedTestId: testId }),
    closeExecutionModal: () => set({ isExecutionModalOpen: false, selectedTestId: null }),
    openEquipementEditModal: (equipementId) => set({ isEquipementEditModalOpen: true, selectedEquipementId: equipementId }),
    closeEquipementEditModal: () => set({ isEquipementEditModalOpen: false, selectedEquipementId: null }),
    openEquipementCreateModal: () => set({ isEquipementCreateModalOpen: true }),
    closeEquipementCreateModal: () => set({ isEquipementCreateModalOpen: false }),
    openEquipementDetailsModal: (equipementId) => set({ isEquipementDetailsModalOpen: true, selectedEquipementId: equipementId }),
    closeEquipementDetailsModal: () => set({ isEquipementDetailsModalOpen: false, selectedEquipementId: null }),
    openInstrumentCreateModal: () => set({ isInstrumentCreateModalOpen: true }),
    closeInstrumentCreateModal: () => set({ isInstrumentCreateModalOpen: false }),
    openInstrumentDetailsModal: (id: string) => set({ isInstrumentDetailsModalOpen: true, selectedInstrumentId: id }),
    closeInstrumentDetailsModal: () => set({ isInstrumentDetailsModalOpen: false, selectedInstrumentId: null }),
    openTypeTestModal: (typeTestId?: string) => set({ isTypeTestModalOpen: true, selectedTypeTestId: typeTestId || null }),
    closeTypeTestModal: () => set({ isTypeTestModalOpen: false, selectedTypeTestId: null }),
}));
