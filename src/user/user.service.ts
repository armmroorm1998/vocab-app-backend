import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /** Generate a random token (used as uid) */
  private generateToken(): string {
    return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
  }

  /** Generate a human-readable recovery key, e.g. ABCDEF-GHIJKL-MNOPQR-STUVWX */
  private generateRecoveryKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const RECOVERY_KEY_LENGTH = 24;
    let key = '';
    for (let i = 0; i < RECOVERY_KEY_LENGTH; i++) {
      if (i > 0 && i % 6 === 0) key += '-';
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
  }

  private generateDisplayName(): string {
    // Example: 2 uppercase letters + 3 digits, e.g. AB123
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    let name = '';
    for (let i = 0; i < 2; i++)
      name += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < 3; i++)
      name += digits[Math.floor(Math.random() * digits.length)];
    return name;
  }

  async registerUser(
    displayName?: string,
  ): Promise<{ user: any; recovery_key: string }> {
    const uid = this.generateToken();
    const recoveryKey = this.generateRecoveryKey();
    const SALT_ROUNDS = 12;
    const recoverKeyHash = await bcrypt.hash(recoveryKey, SALT_ROUNDS);

    // DEBUG LOG
    console.log('[REGISTER] recoveryKey:', recoveryKey);
    console.log('[REGISTER] recoverKeyHash:', recoverKeyHash);

    // Auto-generate displayName if not provided
    const finalDisplayName =
      displayName && displayName.trim() !== ''
        ? displayName
        : this.generateDisplayName();

    // Create user with generated uid and recoveryKeyHash
    const user = await this.createUser(uid, recoverKeyHash, finalDisplayName);

    return {
      user: {
        id: user.id,
        uid: user.uid,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      recovery_key: recoveryKey,
    };
  }

  async recoverByRecoveryKey(
    recoveryKey: string,
  ): Promise<
    | { success: true; user: any; raw_token: string; recovery_key: string }
    | { success: false; message: string }
  > {
    const users = await this.userRepository
      .createQueryBuilder('u')
      .addSelect('u.recoverKeyHash')
      .select([
        'u.id',
        'u.recoverKeyHash',
        'u.uid',
        'u.displayName',
        'u.createdAt',
      ])
      .getMany();

    let matched: User | null = null;
    for (const u of users) {
      const match = await bcrypt.compare(recoveryKey, u.recoverKeyHash);
      if (match) {
        matched = u;
        break;
      }
    }

    if (!matched) {
      return { success: false, message: 'Invalid recovery key' };
    }

    // Generate new token (uid)
    const rawToken = this.generateToken();
    await this.userRepository.update(matched.id, {
      uid: rawToken,
    });

    return {
      success: true,
      user: {
        id: matched.id,
        uid: rawToken,
        displayName: matched.displayName,
        createdAt: matched.createdAt,
      },
      raw_token: rawToken,
      recovery_key: recoveryKey,
    };
  }

  async findByUid(uid: string): Promise<User | undefined> {
    // TypeORM v0.3+ returns null if not found, so convert to undefined
    const user = await this.userRepository.findOne({ where: { uid } });
    return user === null ? undefined : user;
  }

  async createUser(
    uid: string | undefined,
    recoverKeyHash: string,
    displayName?: string,
  ): Promise<User> {
    // If uid is not provided, generate a random one
    let finalUid = uid;
    if (!finalUid) {
      // Generate a random 16-character string (can be replaced with uuid if needed)
      finalUid =
        Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).slice(2, 10);
    }
    const user: User = this.userRepository.create({
      uid: finalUid,
      recoverKeyHash,
      displayName: displayName ?? undefined,
    });
    return this.userRepository.save(user);
  }

  async verifyRecoverKey(uid: string, recoverKey: string): Promise<boolean> {
    const user = await this.findByUid(uid);
    if (!user) return false;
    return await bcrypt.compare(recoverKey, user.recoverKeyHash);
  }

  async updateUid(oldUid: string, newUid: string): Promise<User | undefined> {
    const user = await this.findByUid(oldUid);
    if (!user) return undefined;
    user.uid = newUid;
    return this.userRepository.save(user);
  }
}
