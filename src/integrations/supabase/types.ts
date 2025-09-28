export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          consultation_fee: number | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          patient_user_id: string | null
          provider_id: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          consultation_fee?: number | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          patient_user_id?: string | null
          provider_id: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          consultation_fee?: number | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          patient_user_id?: string | null
          provider_id?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_new: {
        Row: {
          appointment_id: string
          created_at: string
          date_time: string
          notes: string | null
          patient_id: string
          provider_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["appointment_status"] | null
          type: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string
          created_at?: string
          date_time: string
          notes?: string | null
          patient_id: string
          provider_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["appointment_status"] | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          date_time?: string
          notes?: string | null
          patient_id?: string
          provider_id?: string
          provider_role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["appointment_status"] | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_new_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "appointments_new_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          audit_id: string
          ip_address: unknown | null
          new_value: Json | null
          old_value: Json | null
          record_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          table_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          audit_id?: string
          ip_address?: unknown | null
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          table_name: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          audit_id?: string
          ip_address?: unknown | null
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          table_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      care_plans: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          goals: Json | null
          interventions: Json | null
          patient_id: string
          plan_id: string
          plan_type: string
          progress_notes: string | null
          provider_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
          restrictions: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["care_plan_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          interventions?: Json | null
          patient_id: string
          plan_id?: string
          plan_type: string
          progress_notes?: string | null
          provider_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
          restrictions?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["care_plan_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          interventions?: Json | null
          patient_id?: string
          plan_id?: string
          plan_type?: string
          progress_notes?: string | null
          provider_id?: string
          provider_role?: Database["public"]["Enums"]["user_role"]
          restrictions?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["care_plan_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      communication_logs: {
        Row: {
          communication_type: Database["public"]["Enums"]["communication_type"]
          created_at: string
          from_provider_id: string
          from_provider_role: Database["public"]["Enums"]["user_role"]
          log_id: string
          message: string
          patient_id: string
          priority: number | null
          read_at: string | null
          responded_at: string | null
          response: string | null
          subject: string
          to_provider_id: string | null
          to_provider_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          communication_type: Database["public"]["Enums"]["communication_type"]
          created_at?: string
          from_provider_id: string
          from_provider_role: Database["public"]["Enums"]["user_role"]
          log_id?: string
          message: string
          patient_id: string
          priority?: number | null
          read_at?: string | null
          responded_at?: string | null
          response?: string | null
          subject: string
          to_provider_id?: string | null
          to_provider_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          communication_type?: Database["public"]["Enums"]["communication_type"]
          created_at?: string
          from_provider_id?: string
          from_provider_role?: Database["public"]["Enums"]["user_role"]
          log_id?: string
          message?: string
          patient_id?: string
          priority?: number | null
          read_at?: string | null
          responded_at?: string | null
          response?: string | null
          subject?: string
          to_provider_id?: string | null
          to_provider_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          created_at: string
          meal_schedule: Json | null
          notes: string | null
          nutritionist_id: string
          patient_id: string
          plan_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          meal_schedule?: Json | null
          notes?: string | null
          nutritionist_id: string
          patient_id: string
          plan_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          meal_schedule?: Json | null
          notes?: string | null
          nutritionist_id?: string
          patient_id?: string
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["nutritionist_id"]
          },
          {
            foreignKeyName: "diet_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability_schedule: Json | null
          clinic_address: string | null
          consultation_fee: number | null
          created_at: string
          doctor_id: string
          license_number: string | null
          profile_completed: boolean | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          availability_schedule?: Json | null
          clinic_address?: string | null
          consultation_fee?: number | null
          created_at?: string
          doctor_id: string
          license_number?: string | null
          profile_completed?: boolean | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          availability_schedule?: Json | null
          clinic_address?: string | null
          consultation_fee?: number | null
          created_at?: string
          doctor_id?: string
          license_number?: string | null
          profile_completed?: boolean | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      food_delivery_partners: {
        Row: {
          availability_status: boolean | null
          created_at: string
          delivery_zone: string | null
          partner_id: string
          profile_completed: boolean | null
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          availability_status?: boolean | null
          created_at?: string
          delivery_zone?: string | null
          partner_id: string
          profile_completed?: boolean | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          availability_status?: boolean | null
          created_at?: string
          delivery_zone?: string | null
          partner_id?: string
          profile_completed?: boolean | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_delivery_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      food_orders: {
        Row: {
          created_at: string
          delivery_status: Database["public"]["Enums"]["delivery_status"] | null
          dietary_plan_id: string | null
          meal_type: string
          order_id: string
          partner_id: string
          patient_id: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_status?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          dietary_plan_id?: string | null
          meal_type: string
          order_id?: string
          partner_id: string
          patient_id: string
          timestamp?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_status?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          dietary_plan_id?: string | null
          meal_type?: string
          order_id?: string
          partner_id?: string
          patient_id?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_dietary_plan_id_fkey"
            columns: ["dietary_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "food_orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "food_delivery_partners"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "food_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      medical_records: {
        Row: {
          content: Json | null
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          patient_id: string
          patient_user_id: string | null
          provider_id: string
          record_type: string
          title: string
          upload_date: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          patient_id: string
          patient_user_id?: string | null
          provider_id: string
          record_type: string
          title: string
          upload_date?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          patient_id?: string
          patient_user_id?: string | null
          provider_id?: string
          record_type?: string
          title?: string
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records_new: {
        Row: {
          created_at: string
          date: string
          doctor_id: string
          file_url: string | null
          patient_id: string
          record_id: string
          record_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          doctor_id: string
          file_url?: string | null
          patient_id: string
          record_id?: string
          record_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string
          file_url?: string | null
          patient_id?: string
          record_id?: string
          record_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_new_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "medical_records_new_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      nutritionists: {
        Row: {
          availability_schedule: Json | null
          created_at: string
          nutritionist_id: string
          profile_completed: boolean | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          availability_schedule?: Json | null
          created_at?: string
          nutritionist_id: string
          profile_completed?: boolean | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          availability_schedule?: Json | null
          created_at?: string
          nutritionist_id?: string
          profile_completed?: boolean | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutritionists_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          duration_months: number | null
          included_services: Json | null
          name: Database["public"]["Enums"]["package_type"]
          package_id: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_months?: number | null
          included_services?: Json | null
          name: Database["public"]["Enums"]["package_type"]
          package_id?: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_months?: number | null
          included_services?: Json | null
          name?: Database["public"]["Enums"]["package_type"]
          package_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      patient_feedback: {
        Row: {
          created_at: string
          feedback_id: string
          feedback_text: string | null
          patient_id: string
          provider_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
          rating: number | null
          service_type: string
          suggestions: string | null
        }
        Insert: {
          created_at?: string
          feedback_id?: string
          feedback_text?: string | null
          patient_id: string
          provider_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
          rating?: number | null
          service_type: string
          suggestions?: string | null
        }
        Update: {
          created_at?: string
          feedback_id?: string
          feedback_text?: string | null
          patient_id?: string
          provider_id?: string
          provider_role?: Database["public"]["Enums"]["user_role"]
          rating?: number | null
          service_type?: string
          suggestions?: string | null
        }
        Relationships: []
      }
      patient_mood_logs: {
        Row: {
          concerns: string | null
          created_at: string
          energy_level: number | null
          logged_at: string | null
          mood_id: string
          mood_rating: Database["public"]["Enums"]["mood_rating"]
          notes: string | null
          patient_id: string
          sleep_quality: number | null
          stress_level: number | null
        }
        Insert: {
          concerns?: string | null
          created_at?: string
          energy_level?: number | null
          logged_at?: string | null
          mood_id?: string
          mood_rating: Database["public"]["Enums"]["mood_rating"]
          notes?: string | null
          patient_id: string
          sleep_quality?: number | null
          stress_level?: number | null
        }
        Update: {
          concerns?: string | null
          created_at?: string
          energy_level?: number | null
          logged_at?: string | null
          mood_id?: string
          mood_rating?: Database["public"]["Enums"]["mood_rating"]
          notes?: string | null
          patient_id?: string
          sleep_quality?: number | null
          stress_level?: number | null
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          due_date: string | null
          email: string | null
          emergency_contact: string | null
          id: string
          insurance_info: Json | null
          medical_history: Json | null
          name: string
          phone: string | null
          pregnancy_stage: string | null
          profile_picture: string | null
          risk_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          due_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          insurance_info?: Json | null
          medical_history?: Json | null
          name: string
          phone?: string | null
          pregnancy_stage?: string | null
          profile_picture?: string | null
          risk_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          due_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          insurance_info?: Json | null
          medical_history?: Json | null
          name?: string
          phone?: string | null
          pregnancy_stage?: string | null
          profile_picture?: string | null
          risk_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      patient_symptoms: {
        Row: {
          created_at: string
          description: string | null
          logged_at: string | null
          patient_id: string
          relief_methods: string | null
          severity: Database["public"]["Enums"]["symptom_severity"]
          symptom_id: string
          symptom_type: string
          triggers: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          logged_at?: string | null
          patient_id: string
          relief_methods?: string | null
          severity: Database["public"]["Enums"]["symptom_severity"]
          symptom_id?: string
          symptom_type: string
          triggers?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          logged_at?: string | null
          patient_id?: string
          relief_methods?: string | null
          severity?: Database["public"]["Enums"]["symptom_severity"]
          symptom_id?: string
          symptom_type?: string
          triggers?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          doctor_id: string
          due_date: string | null
          email: string | null
          emergency_contact: string | null
          id: string
          medical_history: Json | null
          name: string
          phone: string | null
          pregacare_id: string | null
          pregnancy_stage: string | null
          profile_picture: string | null
          risk_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          doctor_id: string
          due_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          medical_history?: Json | null
          name: string
          phone?: string | null
          pregacare_id?: string | null
          pregnancy_stage?: string | null
          profile_picture?: string | null
          risk_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          doctor_id?: string
          due_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          medical_history?: Json | null
          name?: string
          phone?: string | null
          pregacare_id?: string | null
          pregnancy_stage?: string | null
          profile_picture?: string | null
          risk_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patients_new: {
        Row: {
          address: string | null
          created_at: string
          emergency_contact: string | null
          expected_delivery_date: string | null
          notes: string | null
          package_id: string | null
          patient_id: string
          pregacare_id: string | null
          pregnancy_stage: string | null
          profile_completed: boolean | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          emergency_contact?: string | null
          expected_delivery_date?: string | null
          notes?: string | null
          package_id?: string | null
          patient_id: string
          pregacare_id?: string | null
          pregnancy_stage?: string | null
          profile_completed?: boolean | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          emergency_contact?: string | null
          expected_delivery_date?: string | null
          notes?: string | null
          package_id?: string | null
          patient_id?: string
          pregacare_id?: string | null
          pregnancy_stage?: string | null
          profile_completed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_new_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "patients_new_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          package_id: string
          patient_id: string
          payment_id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          package_id: string
          patient_id: string
          payment_id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          timestamp?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          package_id?: string
          patient_id?: string
          payment_id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      pregacare_patients: {
        Row: {
          created_at: string
          package_subscription: boolean | null
          patient_user_id: string | null
          pregacare_id: string
          registration_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          package_subscription?: boolean | null
          patient_user_id?: string | null
          pregacare_id: string
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          package_subscription?: boolean | null
          patient_user_id?: string | null
          pregacare_id?: string
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          patient_user_id: string | null
          prescribed_date: string
          provider_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          patient_user_id?: string | null
          prescribed_date?: string
          provider_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          patient_user_id?: string | null
          prescribed_date?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          profile_completed: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          profile_completed?: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          availability: Json | null
          bio: string | null
          certification: string | null
          created_at: string
          email: string | null
          experience_years: number | null
          id: string
          name: string
          phone: string | null
          profile_picture: string | null
          provider_type: string
          specialization: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          name: string
          phone?: string | null
          profile_picture?: string | null
          provider_type: string
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          name?: string
          phone?: string | null
          profile_picture?: string | null
          provider_type?: string
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          patient_user_id: string | null
          provider_id: string
          reason: string
          referred_to_id: string | null
          referred_to_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          patient_user_id?: string | null
          provider_id: string
          reason: string
          referred_to_id?: string | null
          referred_to_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          patient_user_id?: string | null
          provider_id?: string
          reason?: string
          referred_to_id?: string | null
          referred_to_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          availability_schedule: Json | null
          created_at: string
          license_number: string | null
          profile_completed: boolean | null
          therapist_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          availability_schedule?: Json | null
          created_at?: string
          license_number?: string | null
          profile_completed?: boolean | null
          therapist_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          availability_schedule?: Json | null
          created_at?: string
          license_number?: string | null
          profile_completed?: boolean | null
          therapist_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapists_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          created_at: string
          mode: string | null
          notes: string | null
          patient_id: string
          session_date: string
          session_id: string
          session_type: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          mode?: string | null
          notes?: string | null
          patient_id: string
          session_date: string
          session_id?: string
          session_type?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          mode?: string | null
          notes?: string | null
          patient_id?: string
          session_date?: string
          session_id?: string
          session_type?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "therapy_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["therapist_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      yoga_sessions: {
        Row: {
          created_at: string
          mode: string | null
          notes: string | null
          patient_id: string
          session_date: string
          session_id: string
          session_type: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          mode?: string | null
          notes?: string | null
          patient_id: string
          session_date: string
          session_id?: string
          session_type?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          mode?: string | null
          notes?: string | null
          patient_id?: string
          session_date?: string
          session_id?: string
          session_type?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yoga_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_new"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "yoga_sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "yoga_trainers"
            referencedColumns: ["trainer_id"]
          },
        ]
      }
      yoga_trainers: {
        Row: {
          availability_schedule: Json | null
          certification_details: string | null
          created_at: string
          profile_completed: boolean | null
          session_types: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          availability_schedule?: Json | null
          certification_details?: string | null
          created_at?: string
          profile_completed?: boolean | null
          session_types?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          availability_schedule?: Json | null
          certification_details?: string | null
          created_at?: string
          profile_completed?: boolean | null
          session_types?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "yoga_trainers_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_pregacare_id: {
        Args: { patient_user_id_param: string }
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_patient_provider: {
        Args: {
          patient_id: string
          provider_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      send_provider_alert: {
        Args: {
          message_param: string
          patient_id_param: string
          priority_param?: number
          subject_param: string
          to_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      validate_pregacare_patient: {
        Args: { patient_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status: "scheduled" | "completed" | "cancelled"
      care_plan_status: "active" | "completed" | "on_hold" | "cancelled"
      communication_type: "alert" | "update" | "request" | "feedback"
      delivery_status: "pending" | "delivered" | "cancelled"
      mood_rating: "very_poor" | "poor" | "neutral" | "good" | "excellent"
      package_type: "basic" | "medium" | "comprehensive"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      symptom_severity: "mild" | "moderate" | "severe"
      user_role:
        | "patient"
        | "doctor"
        | "nutritionist"
        | "therapist"
        | "yoga"
        | "food_partner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["scheduled", "completed", "cancelled"],
      care_plan_status: ["active", "completed", "on_hold", "cancelled"],
      communication_type: ["alert", "update", "request", "feedback"],
      delivery_status: ["pending", "delivered", "cancelled"],
      mood_rating: ["very_poor", "poor", "neutral", "good", "excellent"],
      package_type: ["basic", "medium", "comprehensive"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      symptom_severity: ["mild", "moderate", "severe"],
      user_role: [
        "patient",
        "doctor",
        "nutritionist",
        "therapist",
        "yoga",
        "food_partner",
      ],
    },
  },
} as const
