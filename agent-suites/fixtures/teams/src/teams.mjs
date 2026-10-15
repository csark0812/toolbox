export const ROLES = ['member', 'admin', 'owner']

export function createTeam(name, owner) {
  return {
    name,
    members: [{ userId: owner.id, email: owner.email.toLowerCase(), role: 'owner' }],
    invites: [],
  }
}

export function memberOf(team, userId) {
  return team.members.find((member) => member.userId === userId)
}

export function removeMember(team, userId) {
  team.members = team.members.filter((member) => member.userId !== userId)
}
