'use client'

import Link from 'next/link'
import { Phone, Mail, Building2, Calendar, ClipboardList, User } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import type { Doctor } from '@/types'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface DoctorCardProps {
  doctor: Doctor
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Link href={`/doctors/${doctor.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-primary-800 font-semibold text-lg group-hover:bg-primary-200 transition-colors">
            {doctor.photo_url ? (
              <img src={doctor.photo_url} alt={doctor.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              doctor.name[0]
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors">
                  {doctor.name}
                  {doctor.title && <span className="text-sm text-gray-500 ml-1">{doctor.title}</span>}
                </h3>
                {doctor.specialty && (
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                )}
              </div>
              {doctor.visit_count !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{doctor.visit_count} 次</span>
                </div>
              )}
            </div>

            {doctor.hospital && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{doctor.hospital}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
              {doctor.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {doctor.phone}
                </span>
              )}
              {doctor.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{doctor.email}</span>
                </span>
              )}
            </div>

            {/* Tags */}
            {doctor.tags && doctor.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {doctor.tags.map((tag) => (
                  <Tag key={tag.id} tag={tag} small />
                ))}
              </div>
            )}

            {/* Last visit */}
            {doctor.last_visit_date && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>
                  最近拜訪：{format(new Date(doctor.last_visit_date), 'yyyy/MM/dd', { locale: zhTW })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
