'use client'

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { CalendarDays, User, ChevronRight, AlertCircle, Paperclip } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import type { Visit } from '@/types'

interface VisitTimelineProps {
  visits: Visit[]
  showDoctor?: boolean
}

export default function VisitTimeline({ visits, showDoctor }: VisitTimelineProps) {
  if (visits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">尚無拜訪紀錄</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visits.map((visit, i) => (
        <div key={visit.id} className="relative flex gap-4">
          {/* Timeline line */}
          {i < visits.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 -z-0" />
          )}

          {/* Dot */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-primary-100 border-2 border-primary-300 flex items-center justify-center shrink-0 mt-0.5">
            <CalendarDays className="w-3.5 h-3.5 text-primary-700" />
          </div>

          {/* Content */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="font-semibold text-gray-900 text-sm">
                  {format(new Date(visit.visit_date), 'yyyy年MM月dd日 (EEEE)', { locale: zhTW })}
                </span>
                {showDoctor && (visit as any).doctor_name && (
                  <span className="ml-2 text-sm text-gray-500">{(visit as any).doctor_name}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <User className="w-3 h-3" />
                <span>{visit.user_name || '未知'}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{visit.content}</p>

            {/* Satisfactions */}
            {visit.satisfactions && visit.satisfactions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">服務滿意度</p>
                <div className="space-y-1.5">
                  {visit.satisfactions.map((sat) => (
                    <div key={sat.id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-20 shrink-0">{sat.service_type}</span>
                      <StarRating value={sat.rating} readonly size="sm" />
                      {sat.issue_items && (
                        <span className="text-xs text-red-500 truncate">{sat.issue_items}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {visit.attachments && visit.attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {visit.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    {att.filename}
                  </a>
                ))}
              </div>
            )}

            {/* Next followup */}
            {visit.next_followup && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-orange-600 font-medium">待跟進：</span>
                    <span className="text-gray-600">{visit.next_followup}</span>
                    {visit.next_followup_date && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({format(new Date(visit.next_followup_date), 'MM/dd', { locale: zhTW })})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
