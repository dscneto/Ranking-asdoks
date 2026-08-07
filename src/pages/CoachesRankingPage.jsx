import { useState, useEffect } from 'react'
import { coachesApi } from '../utils/api'
import { getInitials } from '../utils/helpers'
import { EmptyState, PageHeader } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'

export default function CoachesRankingPage() {
    const [ranking, setRanking] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        coachesApi.ranking()
            .then(data => setRanking(data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center py-16 text-[#A8AFBC] gap-2">
            <EvaIcon name="loader-outline" size={20} fill="currentColor" />
            <span className="text-sm">Carregando ranking...</span>
        </div>
    )

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            Erro ao carregar: {error}
        </div>
    )

    if (ranking.length === 0) return (
        <div>
            <PageHeader
                title="Ranking de Professores"
                description="Pontuação acumulada pelos alunos de cada professor."
            />
            <EmptyState
                title="Nenhum professor cadastrado"
                description="Cadastre professores e vincule atletas para ver o ranking aqui."
            />
        </div>
    )

    return (
        <div>
            <PageHeader
                title="Ranking de Professores"
                description="Pontuação acumulada pelos alunos de cada professor."
            />

            <div className="flex flex-col gap-2">
                {ranking.map((coach, index) => {
                    const pos = index + 1
                    const isGold = pos === 1
                    const isSilver = pos === 2
                    const isBronze = pos === 3

                    return (
                        <div
                            key={coach.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm
                ${isGold ? 'bg-[#FEF3C7] border-[#E9B84A]' : ''}
                ${isSilver ? 'bg-[#E6EFFC] border-[#B8CEED]' : ''}
                ${!isGold && !isSilver ? 'bg-white border-[#DDE1EA]' : ''}
              `}
                        >
                            {/* Posição */}
                            <span className={`text-xl font-extrabold w-7 text-center flex-shrink-0
                ${isGold ? 'text-[#C9940A]' : isSilver ? 'text-[#1B4FA8]' : isBronze ? 'text-[#9A5A1A]' : 'text-[#A8AFBC]'}
              `}>
                                {pos}
                            </span>

                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2
                ${isGold ? 'bg-[#FDE68A] text-[#92610A] border-[#E9B84A]' : 'bg-[#E6EFFC] text-[#1B4FA8] border-[#B8CEED]'}
              `}>
                                {getInitials(coach.name)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-[15px] text-[#0D1B35] truncate">
                                    {coach.name}
                                </div>
                                <div className="flex gap-2 flex-wrap mt-1">
                                    {coach.training_unit_label && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F6F8] text-[#4A5568] border border-[#DDE1EA]">
                                            {coach.training_unit_label}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6EFFC] text-[#0D3278]">
                                        {coach.athletes_count} aluno{Number(coach.athletes_count) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Pontos */}
                            <div className="text-right flex-shrink-0">
                                <div className={`text-xl font-extrabold ${isGold ? 'text-[#C9940A]' : 'text-[#1B4FA8]'}`}>
                                    {Number(coach.total_points)}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">
                                    pts
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}