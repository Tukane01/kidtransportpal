export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          color: string
          created_at: string | null
          id: string
          make: string
          model: string
          owner_id: string | null
          owner_id_number: string
          registration_number: string
          updated_at: string | null
          vin_number: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          make: string
          model: string
          owner_id?: string | null
          owner_id_number: string
          registration_number: string
          updated_at?: string | null
          vin_number: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          make?: string
          model?: string
          owner_id?: string | null
          owner_id_number?: string
          registration_number?: string
          updated_at?: string | null
          vin_number?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          created_at: string | null
          id: string
          id_number: string | null
          name: string
          parent_id: string
          school_address: string
          school_name: string
          surname: string
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_number?: string | null
          name: string
          parent_id: string
          school_address: string
          school_name: string
          surname: string
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          id_number?: string | null
          name?: string
          parent_id?: string
          school_address?: string
          school_name?: string
          surname?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey1"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          ride_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          ride_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          ride_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          id_number: string
          name: string | null
          phone: string | null
          profile_image: string | null
          role: string
          surname: string | null
          updated_at: string | null
          wallet_balance: number
        }
        Insert: {
          created_at?: string | null
          id: string
          id_number: string
          name?: string | null
          phone?: string | null
          profile_image?: string | null
          role?: string
          surname?: string | null
          updated_at?: string | null
          wallet_balance?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          id_number?: string
          name?: string | null
          phone?: string | null
          profile_image?: string | null
          role?: string
          surname?: string | null
          updated_at?: string | null
          wallet_balance?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          driver_comment: string | null
          driver_id: string | null
          driver_rating: number | null
          id: string
          parent_comment: string | null
          parent_id: string | null
          parent_rating: number | null
          ride_id: string
        }
        Insert: {
          created_at?: string
          driver_comment?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          id?: string
          parent_comment?: string | null
          parent_id?: string | null
          parent_rating?: number | null
          ride_id: string
        }
        Update: {
          created_at?: string
          driver_comment?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          id?: string
          parent_comment?: string | null
          parent_id?: string | null
          parent_rating?: number | null
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          child_id: string
          created_at: string
          dropoff_address: string
          id: string
          parent_id: string
          pickup_address: string
          pickup_time: string
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          dropoff_address: string
          id?: string
          parent_id: string
          pickup_address: string
          pickup_time: string
          price: number
          status?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          dropoff_address?: string
          id?: string
          parent_id?: string
          pickup_address?: string
          pickup_time?: string
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          child_id: string
          created_at: string
          driver_id: string | null
          driver_location: Json | null
          dropoff_address: string
          dropoff_time: string | null
          id: string
          otp: string
          parent_id: string
          pickup_address: string
          pickup_time: string
          price: number
          request_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          driver_id?: string | null
          driver_location?: Json | null
          dropoff_address: string
          dropoff_time?: string | null
          id?: string
          otp: string
          parent_id: string
          pickup_address: string
          pickup_time: string
          price: number
          request_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          driver_id?: string | null
          driver_location?: Json | null
          dropoff_address?: string
          dropoff_time?: string | null
          id?: string
          otp?: string
          parent_id?: string
          pickup_address?: string
          pickup_time?: string
          price?: number
          request_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deleteuser: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
