<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Equipment;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $employeeId = $user->employee ? $user->employee->id : null;

        $totalEmployees = Employee::count();
        
        if ($isAdmin) {
            $totalEquipment = Equipment::count();
            $pendingLeaveRequests = LeaveRequest::where('status', 'Pending')->count();
        } else {
            $totalEquipment = Equipment::where('assigned_to', $employeeId)->count();
            $pendingLeaveRequests = LeaveRequest::where('employee_id', $employeeId)->where('status', 'Pending')->count();
        }

        // Chart Data
        $employeesByDepartment = Employee::select('department', DB::raw('count(*) as count'))
            ->groupBy('department')
            ->get();

        $equipmentByStatus = Equipment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $leaveRequestsByMonth = LeaveRequest::select(
            DB::raw("strftime('%m', start_date) as month"),
            DB::raw('count(*) as count')
        )
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard data retrieved successfully',
            'data' => [
                'stats' => [
                    'total_employees' => $totalEmployees,
                    'total_equipment' => $totalEquipment,
                    'pending_leave_requests' => $pendingLeaveRequests,
                ],
                'charts' => [
                    'employees_by_department' => $employeesByDepartment,
                    'equipment_by_status' => $equipmentByStatus,
                    'leave_requests_by_month' => $leaveRequestsByMonth,
                ]
            ]
        ]);
    }
}
