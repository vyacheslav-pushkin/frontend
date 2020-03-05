package com.company.scr.entity;

import com.haulmont.chile.core.annotations.NamePattern;
import com.haulmont.cuba.core.entity.StandardEntity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@NamePattern("%s|name")
@Table(name = "SCR_SPECIFICATIONS")
@Entity(name = "scr_Specifications")
public class Specifications extends StandardEntity {
    private static final long serialVersionUID = 8621111988418590217L;

    @Column(name = "NAME")
    protected String name;

    @Column(name = "ENGINE_TYPE")
    protected String engineType;

    @Column(name = "ALL_WHEEL_DRIVE")
    protected Boolean allWheelDrive;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getAllWheelDrive() {
        return allWheelDrive;
    }

    public void setAllWheelDrive(Boolean allWheelDrive) {
        this.allWheelDrive = allWheelDrive;
    }

    public String getEngineType() {
        return engineType;
    }

    public void setEngineType(String engineType) {
        this.engineType = engineType;
    }
}