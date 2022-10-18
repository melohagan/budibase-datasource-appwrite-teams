import { IntegrationBase } from "@budibase/types"
import { Client, Teams } from "node-appwrite";

class CustomIntegration implements IntegrationBase {
  private readonly client: Client
  private readonly teams: Teams

  constructor(config: { endpoint: string; projectId: string; apiKey: string; }) {
    this.client = new Client()
    this.teams = new Teams(this.client)
    this.client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey)
  }

  async create(query: { teamId: string; name: string; roles: string }) {
    let roles: string[] = []
    if (query.roles) {
      roles = JSON.parse(query.roles)
    }
    return await this.teams.create(query.teamId, query.name, roles)
  }

  async read(query: { teamId: string; membershipId: string; extra: { [key:string]: string; } }) {
    if (query.teamId) {
      if (query.extra.type === "Memberships") {
        if (query.membershipId) {
          return await this.teams.getMembership(query.teamId, query.membershipId)
        }
        return await this.teams.listMemberships(query.teamId)
      }
      return await this.teams.get(query.teamId)
    }
    return await this.teams.list()
  }

  async update(query: { teamId: string; name: string; }) {
    return await this.teams.update(query.teamId, query.name)
  }

  async delete(query: { teamId: string; membershipId: string; extra: { [key:string]: string; } }) {
    if (query.extra.type === "Memberships") {
      return await this.teams.deleteMembership(query.teamId, query.membershipId)
    }
    return await this.teams.delete(query.teamId)
  }

  async createMembership(query: { teamId: string; email: string; roles: string; url: string; name: string; }) {
    let roles: string[] = []
    if (query.roles) {
      roles = JSON.parse(query.roles)
    }
    console.log("URL ", query.url)
    return await this.teams.createMembership(
      query.teamId,
      query.email,
      roles,
      query.url,
      query.name
    )
  }

  async updateMembership(query: { teamId: string; membershipId: string; roles: string; userId: string; secret: string; }) {
    let roles: string[] = []
    let response
    if (query.roles) {
      roles = JSON.parse(query.roles)
      response = await this.teams.updateMembershipRoles(query.teamId, query.membershipId, roles)
    }
    if (query.userId) {
      response = await this.teams.updateMembershipStatus(query.teamId, query.membershipId, query.userId, query.secret)
    }
    if (response) {
      return response
    }
    throw new Error("You must provide either roles or userId + secret")
  }
}

export default CustomIntegration
