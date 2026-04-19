<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::with('employee.user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $equipment = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Equipment retrieved successfully',
            'data' => $equipment
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'serial_number' => 'required|string|unique:equipment',
            'assigned_to' => 'nullable|exists:employees,id',
            'status' => 'required|in:available,in use,maintenance',
        ]);

        $equipment = Equipment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment created successfully',
            'data' => $equipment->load('employee.user')
        ]);
    }

    public function show(Equipment $equipment)
    {
        return response()->json([
            'success' => true,
            'message' => 'Equipment retrieved successfully',
            'data' => $equipment->load('employee.user')
        ]);
    }

    public function update(Request $request, Equipment $equipment)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'serial_number' => 'required|string|unique:equipment,serial_number,' . $equipment->id,
            'assigned_to' => 'nullable|exists:employees,id',
            'status' => 'required|in:available,in use,maintenance',
        ]);

        $equipment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipment updated successfully',
            'data' => $equipment->load('employee.user')
        ]);
    }

    public function destroy(Request $request, Equipment $equipment)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment deleted successfully',
            'data' => null
        ]);
    }
}
