export interface SocialLink {
    platform: string
    url: string
}

export interface ArtistProfile {
    name: string
    avatar: string
    style: string
    bio: string
    email?: string
    website?: string
    tags?: string[]
    socials?: SocialLink[]
}
