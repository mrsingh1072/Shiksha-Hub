/**
 * AvatarTeacherPlaceholder
 *
 * Thin wrapper that delegates to the AnimatedTeacher component.
 * Kept as the public API so every consumer (TeacherStage, etc.)
 * continues to import this file without changes.
 */

import AnimatedTeacher from './AnimatedTeacher'

export default function AvatarTeacherPlaceholder({ status = 'idle' }) {
  return <AnimatedTeacher status={status} />
}