"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import {
  recruiterApplicants,
  type ApplicationStatus,
} from "@/app/lib/dashboard-data"
import {
  Avatar,
  DashboardCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  ghostButton,
} from "@/components/dashboard/ui"

const statuses: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Offered",
  "Rejected",
]

export function ApplicantsTable() {
  const [rows, setRows] = useState(recruiterApplicants)

  return (
    <DashboardCard className="overflow-hidden">
      <TableShell>
        <thead>
          <tr>
            <Th>Applicant name</Th>
            <Th>Email</Th>
            <Th>Date applied</Th>
            <Th>Resume</Th>
            <Th>Status</Th>
            <Th className="text-right">Update status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-white/[0.02]">
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={candidate.name} size="sm" />
                  <span className="font-medium text-[#ededef]">
                    {candidate.name}
                  </span>
                </div>
              </Td>
              <Td>
                {candidate.name.toLowerCase().replaceAll(" ", ".")}
                @example.com
              </Td>
              <Td>{candidate.applied}</Td>
              <Td>
                <a href="#" className={ghostButton}>
                  <FileText className="size-3.5" />
                  Resume.pdf
                </a>
              </Td>
              <Td>
                <StatusBadge status={candidate.status} />
              </Td>
              <Td className="text-right">
                <select
                  value={candidate.status}
                  onChange={(event) =>
                    setRows((current) =>
                      current.map((item) =>
                        item.id === candidate.id
                          ? {
                              ...item,
                              status: event.target.value as ApplicationStatus,
                            }
                          : item
                      )
                    )
                  }
                  aria-label={`Update status for ${candidate.name}`}
                  className="rounded-lg border border-white/10 bg-[#0f0f13] px-2 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </DashboardCard>
  )
}
