<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with('user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        $employees = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Employees retrieved successfully',
            'data' => $employees
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'phone' => 'nullable|string',
            'department' => 'required|string',
            'position' => 'required|string',
            'hire_date' => 'required|date',
            'status' => 'required|in:active,inactive',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'employee'
        ]);

        $employee = Employee::create([
            'user_id' => $user->id,
            'phone' => $validated['phone'],
            'department' => $validated['department'],
            'position' => $validated['position'],
            'hire_date' => $validated['hire_date'],
            'status' => $validated['status']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $employee->load('user')
        ]);
    }

    public function show(Employee $employee)
    {
        return response()->json([
            'success' => true,
            'message' => 'Employee retrieved successfully',
            'data' => $employee->load(['user', 'equipment', 'leaveRequests'])
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        if ($request->user()->role !== 'admin' && $request->user()->employee?->id !== $employee->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => ['required', 'email', Rule::unique('users')->ignore($employee->user_id)],
            'phone' => 'nullable|string',
            'department' => 'required|string',
            'position' => 'required|string',
            'hire_date' => 'required|date',
            'status' => 'required|in:active,inactive',
        ]);

        $employee->user->update([
            'name' => $validated['name'],
            'email' => $validated['email']
        ]);

        if ($request->filled('password')) {
            $employee->user->update(['password' => Hash::make($request->password)]);
        }

        $employee->update([
            'phone' => $validated['phone'],
            'department' => $validated['department'],
            'position' => $validated['position'],
            'hire_date' => $validated['hire_date'],
            'status' => $validated['status']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully',
            'data' => $employee->load('user')
        ]);
    }

    public function destroy(Request $request, Employee $employee)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $employee->user->delete(); // This will cascade delete employee

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully',
            'data' => null
        ]);
    }
}
