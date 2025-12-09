export type PrintPresetId = 'a4-vertical' | 'a3-vertical'


export interface CalendarSettings {
  primaryColor: string
  backgroundColor: string
  titleFont: string
  coverImage?: string | null
}

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  settings: CalendarSettings
}
