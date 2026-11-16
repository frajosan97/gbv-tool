<?php
// database/seeders/LookupSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LookupSeeder extends Seeder
{
    public function run(): void
    {
        /* =========================================================
         *  INCIDENT TYPES
         * ========================================================= */
        $this->upsert('incident_types', 'slug', [
            ['slug' => 'rape', 'name' => 'Rape', 'icon' => 'ShieldAlert', 'category' => 'sexual', 'description' => 'Non-consensual sexual intercourse', 'sort_order' => 1],
            ['slug' => 'defilement', 'name' => 'Defilement', 'icon' => 'ShieldAlert', 'category' => 'sexual', 'description' => 'Sexual intercourse with a minor', 'sort_order' => 2],
            ['slug' => 'physical_assault', 'name' => 'Physical Assault', 'icon' => 'Hand', 'category' => 'physical', 'description' => 'Physical violence or battery', 'sort_order' => 3],
            ['slug' => 'emotional_abuse', 'name' => 'Emotional Abuse', 'icon' => 'Frown', 'category' => 'emotional', 'description' => 'Psychological or emotional mistreatment', 'sort_order' => 4],
            ['slug' => 'economic_abuse', 'name' => 'Economic Abuse', 'icon' => 'Wallet', 'category' => 'economic', 'description' => 'Financial control or exploitation', 'sort_order' => 5],
            ['slug' => 'child_marriage', 'name' => 'Child Marriage', 'icon' => 'Baby', 'category' => 'social', 'description' => 'Marriage of a child under 18 years', 'sort_order' => 6],
            ['slug' => 'fgm', 'name' => 'FGM', 'icon' => 'Stethoscope', 'category' => 'social', 'description' => 'Female Genital Mutilation', 'sort_order' => 7],
            ['slug' => 'cyberbullying', 'name' => 'Cyberbullying', 'icon' => 'Laptop', 'category' => 'digital', 'description' => 'Online harassment or bullying', 'sort_order' => 8],
            ['slug' => 'stalking', 'name' => 'Stalking', 'icon' => 'Eye', 'category' => 'other', 'description' => 'Repeated unwanted attention', 'sort_order' => 9],
            ['slug' => 'sexual_harassment', 'name' => 'Sexual Harassment', 'icon' => 'Ban', 'category' => 'sexual', 'description' => 'Unwelcome sexual behavior', 'sort_order' => 10],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'Pin', 'category' => 'other', 'description' => 'Other types of GBV incidents', 'sort_order' => 11],
        ]);

        /* =========================================================
         *  PRIORITY LEVELS
         * ========================================================= */
        $this->upsert('priority_levels', 'slug', [
            ['slug' => 'low', 'name' => 'Low', 'color' => 'success', 'icon' => 'Pin', 'description' => 'Non-urgent, routine follow-up', 'sort_order' => 1],
            ['slug' => 'normal', 'name' => 'Normal', 'color' => 'primary', 'icon' => 'Check', 'description' => 'Standard handling time', 'sort_order' => 2],
            ['slug' => 'high', 'name' => 'High', 'color' => 'warning', 'icon' => 'AlertTriangle', 'description' => 'Requires prompt attention', 'sort_order' => 3],
            ['slug' => 'critical', 'name' => 'Critical', 'color' => 'danger', 'icon' => 'Siren', 'description' => 'Immediate intervention needed', 'sort_order' => 4],
        ]);

        /* =========================================================
         *  CONFIDENTIALITY LEVELS  (no icon column)
         * ========================================================= */
        $this->upsert('confidentiality_levels', 'slug', [
            ['slug' => 'standard', 'name' => 'Standard', 'description' => 'Accessible to all authorized case workers', 'sort_order' => 1],
            ['slug' => 'restricted', 'name' => 'Restricted', 'description' => 'Limited access to senior staff only', 'sort_order' => 2],
            ['slug' => 'anonymous', 'name' => 'Anonymous', 'description' => 'Survivor identity anonymized', 'sort_order' => 3],
        ]);

        /* =========================================================
         *  ID TYPES  (no icon column)
         * ========================================================= */
        $this->upsert('id_types', 'slug', [
            ['slug' => 'national_id', 'name' => 'National ID', 'description' => 'National Identification Card', 'requires_number' => true, 'sort_order' => 1],
            ['slug' => 'passport', 'name' => 'Passport', 'description' => 'International Passport', 'requires_number' => true, 'sort_order' => 2],
            ['slug' => 'birth_certificate', 'name' => 'Birth Certificate', 'description' => 'Birth Certificate', 'requires_number' => true, 'sort_order' => 3],
            ['slug' => 'alien_card', 'name' => 'Alien Card', 'description' => 'Alien Identification Card', 'requires_number' => true, 'sort_order' => 4],
            ['slug' => 'other', 'name' => 'Other', 'description' => 'Other forms of identification', 'requires_number' => false, 'sort_order' => 5],
        ]);

        /* =========================================================
         *  DISABILITY TYPES
         * ========================================================= */
        $this->upsert('disability_types', 'slug', [
            ['slug' => 'physical', 'name' => 'Physical Disability', 'icon' => 'Accessibility', 'category' => 'mobility', 'description' => 'Physical impairment affecting mobility', 'sort_order' => 1],
            ['slug' => 'visual', 'name' => 'Visual Impairment', 'icon' => 'Eye', 'category' => 'sensory', 'description' => 'Blindness or low vision', 'sort_order' => 2],
            ['slug' => 'hearing', 'name' => 'Hearing Impairment', 'icon' => 'Ear', 'category' => 'sensory', 'description' => 'Deafness or hard of hearing', 'sort_order' => 3],
            ['slug' => 'speech', 'name' => 'Speech Impairment', 'icon' => 'MessageCircle', 'category' => 'communication', 'description' => 'Difficulty with speech or communication', 'sort_order' => 4],
            ['slug' => 'intellectual', 'name' => 'Intellectual Disability', 'icon' => 'Brain', 'category' => 'cognitive', 'description' => 'Cognitive or learning difficulties', 'sort_order' => 5],
            ['slug' => 'mental_health', 'name' => 'Mental Health Condition', 'icon' => 'HeartHandshake', 'category' => 'psychosocial', 'description' => 'Mental health disorders or conditions', 'sort_order' => 6],
            ['slug' => 'multiple', 'name' => 'Multiple Disabilities', 'icon' => 'Layers', 'category' => 'multiple', 'description' => 'Two or more types of disabilities', 'sort_order' => 7],
            ['slug' => 'albinism', 'name' => 'Albinism', 'icon' => 'Sparkles', 'category' => 'other', 'description' => 'Albinism condition', 'sort_order' => 8],
            ['slug' => 'other', 'name' => 'Other Disability', 'icon' => 'Pin', 'category' => 'other', 'description' => 'Other types of disabilities', 'sort_order' => 9],
        ]);

        /* =========================================================
         *  AGE RANGES  (no icon column)
         * ========================================================= */
        $this->upsert('age_ranges', 'slug', [
            ['slug' => '0-16', 'name' => '0-16 years', 'min_age' => 0, 'max_age' => 16, 'sort_order' => 1],
            ['slug' => '17-35', 'name' => '17-35 years', 'min_age' => 17, 'max_age' => 35, 'sort_order' => 2],
            ['slug' => '36-59', 'name' => '36-59 years', 'min_age' => 36, 'max_age' => 59, 'sort_order' => 3],
            ['slug' => '60-plus', 'name' => '60+ years', 'min_age' => 60, 'max_age' => null, 'sort_order' => 4],
        ]);

        /* =========================================================
         *  GENDER OPTIONS
         * ========================================================= */
        $this->upsert('gender_options', 'slug', [
            ['slug' => 'male', 'name' => 'Male', 'icon' => 'Mars', 'sort_order' => 1],
            ['slug' => 'female', 'name' => 'Female', 'icon' => 'Venus', 'sort_order' => 2],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'User', 'sort_order' => 3],
        ]);

        /* =========================================================
         *  RELATIONSHIP OPTIONS  (no icon column)
         * ========================================================= */
        $this->upsert('relationship_options', 'slug', [
            ['slug' => 'spouse', 'name' => 'Spouse/Partner', 'sort_order' => 1],
            ['slug' => 'family', 'name' => 'Family Member', 'sort_order' => 2],
            ['slug' => 'neighbour', 'name' => 'Neighbour', 'sort_order' => 3],
            ['slug' => 'colleague', 'name' => 'Colleague', 'sort_order' => 4],
            ['slug' => 'stranger', 'name' => 'Stranger', 'sort_order' => 5],
            ['slug' => 'authority', 'name' => 'Authority Figure', 'sort_order' => 6],
            ['slug' => 'other', 'name' => 'Other', 'sort_order' => 7],
        ]);

        /* =========================================================
         *  CASE STATUS OPTIONS
         * ========================================================= */
        $this->upsert('case_status_options', 'slug', [
            ['slug' => 'reported', 'name' => 'Reported', 'color' => 'info', 'icon' => 'Siren', 'is_concluded' => false, 'description' => 'Case has been reported', 'sort_order' => 1],
            ['slug' => 'under_investigation', 'name' => 'Under Investigation', 'color' => 'warning', 'icon' => 'Search', 'is_concluded' => false, 'description' => 'Case under active investigation', 'sort_order' => 2],
            ['slug' => 'medical_attention', 'name' => 'Medical Attention', 'color' => 'primary', 'icon' => 'HeartPulse', 'is_concluded' => false, 'description' => 'Receiving medical care', 'sort_order' => 3],
            ['slug' => 'legal_proceedings', 'name' => 'Legal Proceedings', 'color' => 'danger', 'icon' => 'Scale', 'is_concluded' => false, 'description' => 'Case in legal process', 'sort_order' => 4],
            ['slug' => 'counselling', 'name' => 'Counselling', 'color' => 'info', 'icon' => 'MessagesSquare', 'is_concluded' => false, 'description' => 'Receiving psychosocial support', 'sort_order' => 5],
            ['slug' => 'shelter_provided', 'name' => 'Shelter Provided', 'color' => 'success', 'icon' => 'Home', 'is_concluded' => false, 'description' => 'Survivor in safe shelter', 'sort_order' => 6],
            ['slug' => 'concluded', 'name' => 'Concluded', 'color' => 'success', 'icon' => 'CheckCircle2', 'is_concluded' => true, 'description' => 'Case concluded successfully', 'sort_order' => 7],
            ['slug' => 'closed', 'name' => 'Closed', 'color' => 'secondary', 'icon' => 'Lock', 'is_concluded' => true, 'description' => 'Case closed (no further action)', 'sort_order' => 8],
            ['slug' => 'reopened', 'name' => 'Reopened', 'color' => 'warning', 'icon' => 'Unlock', 'is_concluded' => false, 'description' => 'Previously closed case reopened', 'sort_order' => 9],
        ]);

        /* =========================================================
         *  CONCLUSION TYPES
         * ========================================================= */
        $this->upsert('conclusion_types', 'slug', [
            ['slug' => 'successful_prosecution', 'name' => 'Successful Prosecution', 'icon' => 'Scale', 'color' => 'success', 'description' => 'Perpetrator successfully prosecuted', 'sort_order' => 1],
            ['slug' => 'out_of_court_settlement', 'name' => 'Out of Court Settlement', 'icon' => 'Handshake', 'color' => 'info', 'description' => 'Settled outside court', 'sort_order' => 2],
            ['slug' => 'referred_to_other_agency', 'name' => 'Referred to Other Agency', 'icon' => 'ArrowRightLeft', 'color' => 'primary', 'description' => 'Case referred to another organization', 'sort_order' => 3],
            ['slug' => 'survivor_declined_further_action', 'name' => 'Survivor Declined Further Action', 'icon' => 'Ban', 'color' => 'warning', 'description' => 'Survivor chose not to proceed', 'sort_order' => 4],
            ['slug' => 'insufficient_evidence', 'name' => 'Insufficient Evidence', 'icon' => 'FileQuestion', 'color' => 'danger', 'description' => 'Case closed due to lack of evidence', 'sort_order' => 5],
            ['slug' => 'survivor_relocated', 'name' => 'Survivor Relocated', 'icon' => 'Home', 'color' => 'secondary', 'description' => 'Survivor relocated for safety', 'sort_order' => 6],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'Pin', 'color' => 'secondary', 'description' => 'Other conclusion types', 'sort_order' => 7],
        ]);

        /* =========================================================
         *  REFERRAL TYPES
         * ========================================================= */
        $this->upsert('referral_types', 'slug', [
            ['slug' => 'medical', 'name' => 'Medical Attention', 'icon' => 'HeartPulse', 'color' => 'danger', 'description' => 'Referral to medical services', 'sort_order' => 1],
            ['slug' => 'legal', 'name' => 'Legal Proceedings', 'icon' => 'Scale', 'color' => 'primary', 'description' => 'Referral to legal aid', 'sort_order' => 2],
            ['slug' => 'psychosocial', 'name' => 'Psychosocial Support', 'icon' => 'MessagesSquare', 'color' => 'info', 'description' => 'Referral to counseling services', 'sort_order' => 3],
            ['slug' => 'shelter', 'name' => 'Shelter Provided', 'icon' => 'Home', 'color' => 'success', 'description' => 'Referral to safe housing', 'sort_order' => 4],
            ['slug' => 'economic_empowerment', 'name' => 'Economic Empowerment', 'icon' => 'Wallet', 'color' => 'warning', 'description' => 'Referral to economic support programs', 'sort_order' => 5],
            ['slug' => 'police', 'name' => 'Police Referral', 'icon' => 'Shield', 'color' => 'danger', 'description' => 'Referral to police / OB desk', 'sort_order' => 6],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'Pin', 'color' => 'secondary', 'description' => 'Other referral services', 'sort_order' => 7],
        ]);

        /* =========================================================
         *  URGENCY OPTIONS
         * ========================================================= */
        $this->upsert('urgency_options', 'slug', [
            ['slug' => 'low', 'name' => 'Low', 'color' => 'secondary', 'icon' => 'Pin', 'description' => 'Non-urgent, routine follow-up', 'sort_order' => 1],
            ['slug' => 'normal', 'name' => 'Normal', 'color' => 'primary', 'icon' => 'Check', 'description' => 'Standard handling time', 'sort_order' => 2],
            ['slug' => 'high', 'name' => 'High', 'color' => 'warning', 'icon' => 'AlertTriangle', 'description' => 'Requires prompt attention', 'sort_order' => 3],
            ['slug' => 'critical', 'name' => 'Critical', 'color' => 'danger', 'icon' => 'Siren', 'description' => 'Immediate intervention needed', 'sort_order' => 4],
        ]);

        /* =========================================================
         *  TIMELINE EVENT TYPES
         * ========================================================= */
        $this->upsert('timeline_event_types', 'slug', [
            ['slug' => 'case_created', 'name' => 'Case Created', 'icon' => 'PlusCircle', 'color' => 'success', 'sort_order' => 1],
            ['slug' => 'status_changed', 'name' => 'Status Changed', 'icon' => 'RefreshCw', 'color' => 'info', 'sort_order' => 2],
            ['slug' => 'file_uploaded', 'name' => 'File Uploaded', 'icon' => 'FileText', 'color' => 'secondary', 'sort_order' => 3],
            ['slug' => 'referral_made', 'name' => 'Referral Made', 'icon' => 'Send', 'color' => 'warning', 'sort_order' => 4],
            ['slug' => 'referral_closed', 'name' => 'Referral Closed', 'icon' => 'Inbox', 'color' => 'secondary', 'sort_order' => 5],
            ['slug' => 'note_added', 'name' => 'Note Added', 'icon' => 'MessageSquare', 'color' => 'secondary', 'sort_order' => 6],
            ['slug' => 'case_concluded', 'name' => 'Case Concluded', 'icon' => 'CheckCircle2', 'color' => 'success', 'sort_order' => 7],
            ['slug' => 'case_reopened', 'name' => 'Case Reopened', 'icon' => 'Unlock', 'color' => 'warning', 'sort_order' => 8],
        ]);

        /* =========================================================
         *  FILE TYPES
         * ========================================================= */
        $this->upsert('file_types', 'slug', [
            ['slug' => 'police_report', 'name' => 'Police Report', 'icon' => 'Shield', 'color' => 'danger', 'is_evidence' => true, 'requires_review' => true, 'sort_order' => 10],
            ['slug' => 'medical_report', 'name' => 'Medical Report', 'icon' => 'HeartPulse', 'color' => 'warning', 'is_evidence' => true, 'requires_review' => true, 'sort_order' => 20],
            ['slug' => 'counselling_notes', 'name' => 'Counselling Notes', 'icon' => 'MessagesSquare', 'color' => 'info', 'is_evidence' => false, 'requires_review' => false, 'sort_order' => 30],
            ['slug' => 'legal_document', 'name' => 'Legal Document', 'icon' => 'Scale', 'color' => 'primary', 'is_evidence' => true, 'requires_review' => true, 'sort_order' => 40],
            ['slug' => 'shelter_intake', 'name' => 'Shelter Intake', 'icon' => 'Home', 'color' => 'success', 'is_evidence' => false, 'requires_review' => false, 'sort_order' => 50],
            ['slug' => 'statement', 'name' => 'Statement', 'icon' => 'FileText', 'color' => 'secondary', 'is_evidence' => true, 'requires_review' => true, 'sort_order' => 60],
            ['slug' => 'evidence', 'name' => 'Evidence', 'icon' => 'Paperclip', 'color' => 'danger', 'is_evidence' => true, 'requires_review' => true, 'sort_order' => 70],
            ['slug' => 'court_document', 'name' => 'Court Document', 'icon' => 'Landmark', 'color' => 'primary', 'is_evidence' => true, 'requires_review' => true, 'sort_order' => 80],
            ['slug' => 'referral_form', 'name' => 'Referral Form', 'icon' => 'Send', 'color' => 'info', 'is_evidence' => false, 'requires_review' => false, 'sort_order' => 90],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'Folder', 'color' => 'secondary', 'is_evidence' => false, 'requires_review' => false, 'sort_order' => 999],
        ]);

        /* =========================================================
         *  NOTE TYPES
         * ========================================================= */
        $this->upsert('note_types', 'slug', [
            ['slug' => 'general', 'name' => 'General', 'icon' => 'MessageSquare', 'color' => 'secondary', 'is_private_by_default' => false, 'sort_order' => 10],
            ['slug' => 'follow_up', 'name' => 'Follow Up', 'icon' => 'CalendarClock', 'color' => 'info', 'is_private_by_default' => false, 'sort_order' => 20],
            ['slug' => 'assessment', 'name' => 'Assessment', 'icon' => 'ClipboardList', 'color' => 'warning', 'is_private_by_default' => false, 'sort_order' => 30],
            ['slug' => 'referral_note', 'name' => 'Referral Note', 'icon' => 'Send', 'color' => 'info', 'is_private_by_default' => false, 'sort_order' => 40],
            ['slug' => 'counselling_note', 'name' => 'Counselling Note', 'icon' => 'MessagesSquare', 'color' => 'primary', 'is_private_by_default' => true, 'sort_order' => 50],
            ['slug' => 'legal_note', 'name' => 'Legal Note', 'icon' => 'Scale', 'color' => 'primary', 'is_private_by_default' => true, 'sort_order' => 60],
            ['slug' => 'medical_note', 'name' => 'Medical Note', 'icon' => 'HeartPulse', 'color' => 'warning', 'is_private_by_default' => true, 'sort_order' => 70],
            ['slug' => 'safety_plan', 'name' => 'Safety Plan', 'icon' => 'ShieldCheck', 'color' => 'danger', 'is_private_by_default' => true, 'sort_order' => 80],
            ['slug' => 'progress_note', 'name' => 'Progress Note', 'icon' => 'TrendingUp', 'color' => 'success', 'is_private_by_default' => false, 'sort_order' => 90],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'Folder', 'color' => 'secondary', 'is_private_by_default' => false, 'sort_order' => 999],
        ]);

        /* =========================================================
         *  ORGANIZATION TYPES
         *
         *  NOTE: `organization_types` must exist in a migration
         *  (typically `create_partners_table`). If it does not,
         *  either create it or remove this block.
         * ========================================================= */
        $this->upsert('organization_types', 'slug', [
            ['slug' => 'government', 'name' => 'Government Agency', 'icon' => 'Landmark', 'description' => 'Government health / justice / social services', 'sort_order' => 1],
            ['slug' => 'ngo', 'name' => 'NGO', 'icon' => 'HeartHandshake', 'description' => 'Non-governmental organization', 'sort_order' => 2],
            ['slug' => 'cbo', 'name' => 'CBO', 'icon' => 'Users', 'description' => 'Community-based organization', 'sort_order' => 3],
            ['slug' => 'hospital', 'name' => 'Hospital / Health', 'icon' => 'HeartPulse', 'description' => 'Health facility offering clinical services', 'sort_order' => 4],
            ['slug' => 'police', 'name' => 'Police Station', 'icon' => 'Shield', 'description' => 'Police OB desk / GBV unit', 'sort_order' => 5],
            ['slug' => 'shelter', 'name' => 'Shelter', 'icon' => 'Home', 'description' => 'Safe house / shelter provider', 'sort_order' => 6],
            ['slug' => 'legal_aid', 'name' => 'Legal Aid', 'icon' => 'Scale', 'description' => 'Legal aid / pro bono legal services', 'sort_order' => 7],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'Folder', 'description' => 'Other type of partner organization', 'sort_order' => 999],
        ]);
    }

    private function upsert(string $table, string $uniqueKey, array $rows): void
    {
        $now = now();

        $payload = array_map(fn(array $row) => array_merge([
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ], $row), $rows);

        $payload = array_values(array_filter(
            $payload,
            fn(array $r) => isset($r[$uniqueKey]) && $r[$uniqueKey] !== ''
        ));

        DB::table($table)->upsert(
            $payload,
            [$uniqueKey],
            array_values(array_diff(
                array_keys($payload[0] ?? []),
                [$uniqueKey, 'created_at']
            ))
        );
    }
}