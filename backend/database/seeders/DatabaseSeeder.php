<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Employee;
use App\Models\Equipment;
use App\Models\LeaveRequest;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    // use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@hr.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $employees = [];
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => "Employee $i",
                'email' => "employee$i@hr.com",
                'password' => Hash::make('password'),
                'role' => 'employee',
            ]);

            $employees[] = Employee::create([
                'user_id' => $user->id,
                'phone' => '123456789' . $i,
                'department' => ['IT', 'HR', 'Engineering', 'Sales'][array_rand(['IT', 'HR', 'Engineering', 'Sales'])],
                'position' => ['Staff', 'Manager', 'Developer', 'Analyst'][array_rand(['Staff', 'Manager', 'Developer', 'Analyst'])],
                'hire_date' => now()->subDays(rand(10, 1000)),
                'status' => 'active',
            ]);
        }

        for ($i = 1; $i <= 15; $i++) {
            $assigned = rand(0, 1) ? $employees[array_rand($employees)]->id : null;
            Equipment::create([
                'name' => ['Laptop', 'Monitor', 'Desk', 'Mouse', 'Keyboard'][array_rand(['Laptop', 'Monitor', 'Desk', 'Mouse', 'Keyboard'])] . " " . $i,
                'category' => ['Electronics', 'Furniture', 'Accessories'][array_rand(['Electronics', 'Furniture', 'Accessories'])],
                'serial_number' => 'SN-2026-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'assigned_to' => $assigned,
                'status' => $assigned ? 'in use' : 'available',
            ]);
        }

        for ($i = 1; $i <= 8; $i++) {
            LeaveRequest::create([
                'employee_id' => $employees[array_rand($employees)]->id,
                'type' => ['Sick Leave', 'Vacation', 'Personal'][array_rand(['Sick Leave', 'Vacation', 'Personal'])],
                'start_date' => now()->addDays(rand(1, 10)),
                'end_date' => now()->addDays(rand(11, 20)),
                'reason' => 'Automatically generated reason for leave.',
                'status' => ['Pending', 'Approved', 'Rejected'][array_rand(['Pending', 'Approved', 'Rejected'])],
            ]);
        }
    }
}
