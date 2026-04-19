<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    /** @use HasFactory<\Database\Factories\EquipmentFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'serial_number',
        'assigned_to',
        'status',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }
}
