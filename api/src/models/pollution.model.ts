import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Type for pollution types
export type PollutionType = 'plastique' | 'chimique' | 'depot-sauvage' | 'eau' | 'air' | 'autre';

// Interface for Pollution attributes
export interface PollutionAttributes {
  id: number;
  title: string;
  type: PollutionType;
  description: string;
  observedAt: Date;
  location: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  photo?: Buffer;
  photoMimeType?: string;
  discoveredBy: string;
}

// Optional fields for creation (id is auto-generated)
interface PollutionCreationAttributes extends Optional<PollutionAttributes, 'id' | 'photoUrl' | 'photo' | 'photoMimeType'> {}

// Model class
export class Pollution extends Model<PollutionAttributes, PollutionCreationAttributes> 
  implements PollutionAttributes {
  public id!: number;
  public title!: string;
  public type!: PollutionType;
  public description!: string;
  public observedAt!: Date;
  public location!: string;
  public latitude!: number;
  public longitude!: number;
  public photoUrl?: string;
  public photo?: Buffer;
  public photoMimeType?: string;
  public discoveredBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Pollution.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('plastique', 'chimique', 'depot-sauvage', 'eau', 'air', 'autre'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    observedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
      field: 'photo'
    },
    photoMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'photo_mime_type'
    },
    discoveredBy: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'pollutions',
    timestamps: false
  });

  return Pollution;
};
