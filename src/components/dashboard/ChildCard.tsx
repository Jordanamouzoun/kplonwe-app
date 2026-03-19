import { GraduationCap, School } from 'lucide-react';
import type { Child } from '@/types';

interface ChildCardProps { child: Child; }

export function ChildCard({ child }: ChildCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ border:'1px solid #f1f5f9' }}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-primary-600">
            {child.firstName[0]}{child.lastName[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{child.firstName} {child.lastName}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {child.level && (
              <div className="flex items-center gap-1"><GraduationCap size={14}/><span>{child.level}</span></div>
            )}
            {child.school && (
              <div className="flex items-center gap-1"><School size={14}/><span>{child.school}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
