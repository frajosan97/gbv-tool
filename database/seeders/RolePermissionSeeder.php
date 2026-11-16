<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ---- Permissions ----
        $permissions = [
            // Survivors
            'view survivors',
            'create survivors',
            'update survivors',
            'delete survivors',

            // Cases
            'view gbv cases',
            'create gbv cases',
            'update gbv cases',
            'conclude gbv cases',
            'reopen gbv cases',

            // Case files
            'upload case files',
            'review case files',
            'delete case files',

            // Referrals
            'create referrals',
            'accept referrals',
            'complete referrals',

            // Notes & timelines
            'view case notes',
            'create case notes',
            'view private notes',
            'create timelines',

            // Perpetrators
            'manage perpetrators',

            // Admin
            'manage users',
            'manage partners',
            'manage lookups',
            'view audit logs',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // ---- Roles ----
        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $admin = Role::findOrCreate('Admin', 'web');
        $caseWorker = Role::findOrCreate('Case Worker', 'web');
        $counsellor = Role::findOrCreate('Counsellor', 'web');
        $partner = Role::findOrCreate('Partner', 'web');

        // Super Admin: everything
        $superAdmin->syncPermissions(Permission::all());

        // Admin: everything except managing lookups (delegate to super admin)
        $admin->syncPermissions(
            Permission::whereNotIn('name', ['manage lookups'])->get()
        );

        // Case Worker: open/track cases, upload files, referrals, notes
        $caseWorker->syncPermissions([
            'view survivors',
            'create survivors',
            'update survivors',
            'view gbv cases',
            'create gbv cases',
            'update gbv cases',
            'upload case files',
            'create referrals',
            'view case notes',
            'create case notes',
            'create timelines',
            'manage perpetrators',
        ]);

        // Counsellor: notes + private notes + view cases
        $counsellor->syncPermissions([
            'view survivors',
            'view gbv cases',
            'view case notes',
            'create case notes',
            'view private notes',
            'create timelines',
        ]);

        // Partner: scoped view/create, referrals
        $partner->syncPermissions([
            'view survivors',
            'create survivors',
            'view gbv cases',
            'create gbv cases',
            'create referrals',
            'accept referrals',
            'complete referrals',
            'upload case files',
        ]);
    }
}