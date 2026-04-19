<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LeaveRequest::with('employee.user');

        if ($user->role !== 'admin') {
            $query->where('employee_id', current($user->employee ? [$user->employee->id] : [0]));
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Leave requests retrieved successfully',
            'data' => $leaveRequests
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $employee_id = $user->employee ? $user->employee->id : null;

        if (!$employee_id) {
            return response()->json(['success' => false, 'message' => 'User does not have an employee profile'], 400);
        }

        $validated = $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $leaveRequest = LeaveRequest::create([
            'employee_id' => $employee_id,
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'status' => 'Pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request submitted successfully',
            'data' => $leaveRequest->load('employee.user')
        ]);
    }

    public function show(LeaveRequest $leaveRequest, Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $leaveRequest->employee_id !== ($user->employee ? $user->employee->id : null)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Leave request retrieved',
            'data' => $leaveRequest->load('employee.user')
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:Pending,Approved,Rejected',
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);
        $leaveRequest->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request status updated successfully',
            'data' => $leaveRequest->load('employee.user')
        ]);
    }

    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        // For general updates if needed
        return response()->json(['success' => false, 'message' => 'Not implemented'], 501);
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        // Optionally allow users to delete their pending requests
        if ($leaveRequest->status !== 'Pending') {
             return response()->json(['success' => false, 'message' => 'Cannot delete non-pending request'], 400);
        }
        $leaveRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leave request deleted',
            'data' => null
        ]);
    }
}
