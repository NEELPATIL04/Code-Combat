import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { userAPI } from '../../../utils/api';

interface Participant {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
    createdAt: string;
}

const Participants: React.FC = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadParticipants();
    }, []);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            // Filter only players (participants)
            const players = data.users.filter((u: Participant) => u.role === 'player');
            setParticipants(players);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.firstName && p.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.lastName && p.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRowClick = (id: number) => {
        navigate(`/admin/participants/${id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const activeParticipants = participants.filter(p => p.status === 'active');

    return (
        <AdminLayout>
            <div className="max-w-[1400px]">
                {/* Page Header */}
                <header className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-semibold m-0 mb-2 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            Participants
                        </h1>
                        <p className="text-white/50 m-0">View and manage all participants</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center py-3 px-6 bg-white/[0.03] border border-white/10 rounded-lg">
                            <span className="block text-2xl font-semibold text-yellow-200">{participants.length}</span>
                            <span className="text-xs text-white/50 uppercase">Total</span>
                        </div>
                        <div className="text-center py-3 px-6 bg-white/[0.03] border border-white/10 rounded-lg">
                            <span className="block text-2xl font-semibold text-yellow-200">{activeParticipants.length}</span>
                            <span className="text-xs text-white/50 uppercase">Active</span>
                        </div>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-6 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search participants by name, username, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 px-4 pl-11 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder:text-white/30 font-inherit text-[0.95rem] focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30"
                    />
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-15 text-white/50">
                        <p>Loading participants...</p>
                    </div>
                ) : (
                    /* Table */
                    <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 py-4 px-6 bg-white/[0.03] text-xs text-white/50 uppercase tracking-wider font-semibold items-center">
                            <span>Participant</span>
                            <span>Email</span>
                            <span>Status</span>
                            <span>Joined</span>
                            <span></span>
                        </div>

                        {/* Empty State */}
                        {filteredParticipants.length === 0 ? (
                            <div className="py-15 px-6 text-center text-white/50 text-[0.95rem]">
                                {searchTerm ? 'No participants found matching your search' : 'No participants yet'}
                            </div>
                        ) : (
                            /* Table Rows */
                            filteredParticipants.map(participant => (
                                <div
                                    key={participant.id}
                                    className="grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 py-4 px-6 border-t border-white/[0.06] items-center transition-all duration-200 cursor-pointer hover:bg-white/[0.04] group"
                                    onClick={() => handleRowClick(participant.id)}
                                >
                                    {/* Participant Cell */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-600 flex items-center justify-center font-semibold text-sm text-black flex-shrink-0">
                                            {participant.firstName
                                                ? participant.firstName.charAt(0).toUpperCase()
                                                : participant.username.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-white">{participant.username}</span>
                                            {participant.firstName && participant.lastName && (
                                                <span className="text-[0.85rem] text-white/60">{participant.firstName} {participant.lastName}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email Cell */}
                                    <span className="text-white/50 text-sm">{participant.email}</span>

                                    {/* Status Cell */}
                                    <span className="flex items-center">
                                        <span className={`py-1 px-3 rounded-xl text-xs font-medium capitalize ${
                                                participant.status === 'active'
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                            {participant.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </span>

                                    {/* Date Cell */}
                                    <span className="text-white/50 text-sm">{formatDate(participant.createdAt)}</span>

                                    {/* Arrow Cell */}
                                    <span className="flex items-center justify-center text-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ChevronRight size={18} />
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Participants;
