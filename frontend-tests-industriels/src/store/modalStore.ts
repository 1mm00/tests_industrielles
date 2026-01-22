import { create } from 'zustand';

interface ModalState {
    isTestModalOpen: boolean;
    isNcModalOpen: boolean;
    isReportModalOpen: boolean;
    isUserModalOpen: boolean;
    selectedUser: any | null;
    openTestModal: () => void;
    closeTestModal: () => void;
    openNcModal: () => void;
    closeNcModal: () => void;
    openReportModal: () => void;
    closeReportModal: () => void;
    openUserModal: (user?: any) => void;
    closeUserModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isTestModalOpen: false,
    isNcModalOpen: false,
    isReportModalOpen: false,
    isUserModalOpen: false,
    selectedUser: null,
    openTestModal: () => set({ isTestModalOpen: true }),
    closeTestModal: () => set({ isTestModalOpen: false }),
    openNcModal: () => set({ isNcModalOpen: true }),
    closeNcModal: () => set({ isNcModalOpen: false }),
    openReportModal: () => set({ isReportModalOpen: true }),
    closeReportModal: () => set({ isReportModalOpen: false }),
    openUserModal: (user = null) => set({ isUserModalOpen: true, selectedUser: user }),
    closeUserModal: () => set({ isUserModalOpen: false, selectedUser: null }),
}));
