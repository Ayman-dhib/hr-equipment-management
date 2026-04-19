<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'department',
        'position',
        'hire_date',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'assigned_to');
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
