import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from 'src/app/services/admin.service';

export interface PurchaseItem {
  item_type: string;
  item_id: string;
  usages_left: number | null;
}

export interface EconomyLeaderboardItem {
  account_id: string;
  tickets: number;
  name: string;
  v2Tag: string;
  rank?: number;
}

export interface PurchaserItem {
  account_id: string;
  item_type: string;
  item_id: string;
  usages_left: number | null;
  name: string;
  v2Tag: string;
}

export interface TransactionItem {
  id: number;
  account_id: string;
  action: string;
  amount: number;
  item_id: string;
  timestamp: string;
}

@Component({
  selector: 'app-economy-management',
  templateUrl: './economy-management.component.html',
  styleUrls: ['./economy-management.component.scss'],
  standalone: false,
})
export class EconomyManagementComponent implements OnInit {
  selectedTab = 0;

  // ==================== Tab 1: Player Inventory & Economy Leaderboard ====================
  searchAccountControl = new FormControl('');
  recentPlayers: any[] = [];
  isLoadingPlayer = false;
  playerSearched = false;
  selectedAccountId = '';
  playerTickets: number | null = null;
  playerPurchases: PurchaseItem[] = [];

  // Economy Leaderboard (shown when no player is selected)
  leaderboardList: EconomyLeaderboardItem[] = [];
  isLoadingLeaderboard = false;

  // Ticket Adjust Form
  ticketAmountControl = new FormControl(100);
  ticketAction: 'add' | 'remove' | 'set' = 'add';
  isAdjustingTickets = false;

  // Grant Item Form
  grantType: 'command' | 'effect' = 'command';
  grantItemIdControl = new FormControl('kick');
  grantUsagesControl = new FormControl(3);
  isGrantingItem = false;

  presetCommands = [
    'kick',
    'ban',
    'fly',
    'heal',
    'freeze',
    'kill',
    'curse',
    'spaz',
    'shield',
    'invisible',
    'speed',
    'floater',
  ];

  presetEffects = [
    'rainbow',
    'fairydust',
    'spark',
    'glow',
    'slime',
    'metal',
    'ice',
    'sweat',
    'ghost',
  ];

  // ==================== Tab 2: Server-Wide Active Purchasers ====================
  purchasersDataSource = new MatTableDataSource<PurchaserItem>([]);
  displayedPurchasersColumns = [
    'account_id',
    'item_type',
    'item_id',
    'usages_left',
    'actions',
  ];
  totalPurchasers = 0;
  purchaserPage = 1;
  purchaserPerPage = 50;
  isLoadingPurchasers = false;

  // ==================== Tab 3: Transaction Logs ====================
  filterAccountControl = new FormControl('');
  transactionsDataSource = new MatTableDataSource<TransactionItem>([]);
  displayedTransactionColumns = [
    'id',
    'timestamp',
    'account_id',
    'action',
    'item_id',
    'amount',
  ];
  totalTransactions = 0;
  transactionPage = 1;
  transactionPerPage = 50;
  isLoadingTransactions = false;

  @ViewChild('txPaginator') txPaginator!: MatPaginator;
  @ViewChild('purchaserPaginator') purchaserPaginator!: MatPaginator;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRecentPlayers();
    this.loadEconomyLeaderboard();
    this.loadActivePurchasers();
    this.loadTransactions();

    this.route.queryParams.subscribe((params) => {
      if (params['account_id']) {
        this.searchAccountControl.setValue(params['account_id']);
        this.onSearchPlayer();
      }
      if (params['tab']) {
        this.selectedTab = parseInt(params['tab'], 10) || 0;
      }
    });
  }

  loadRecentPlayers(): void {
    this.adminService.getRecentPlayers().subscribe({
      next: (recents) => {
        this.recentPlayers = Array.isArray(recents) ? recents : [];
      },
      error: () => {},
    });
  }

  loadEconomyLeaderboard(): void {
    this.isLoadingLeaderboard = true;
    this.adminService.getEconomyLeaderboard(20).subscribe({
      next: (data) => {
        this.isLoadingLeaderboard = false;
        if (Array.isArray(data)) {
          this.leaderboardList = data.map((item, index) => ({
            ...item,
            rank: index + 1,
          }));
        } else {
          this.leaderboardList = [];
        }
      },
      error: () => {
        this.isLoadingLeaderboard = false;
        this.leaderboardList = [];
      },
    });
  }

  // ==================== Player Inventory & Balance ====================

  onSelectRecentPlayer(pbid: string): void {
    if (!pbid) return;
    this.searchAccountControl.setValue(pbid);
    this.onSearchPlayer();
  }

  inspectPlayerById(accountId: string): void {
    if (!accountId) return;
    this.selectedTab = 0;
    this.searchAccountControl.setValue(accountId);
    this.onSearchPlayer();
  }

  clearPlayerSearch(): void {
    this.searchAccountControl.setValue('');
    this.selectedAccountId = '';
    this.playerSearched = false;
    this.playerTickets = null;
    this.playerPurchases = [];
    this.loadEconomyLeaderboard();
  }

  onSearchPlayer(): void {
    const accountId = this.searchAccountControl.value?.trim();
    if (!accountId) return;

    this.isLoadingPlayer = true;
    this.playerSearched = true;
    this.selectedAccountId = accountId;

    this.adminService.getPlayerPurchases(accountId).subscribe({
      next: (data) => {
        this.isLoadingPlayer = false;
        this.playerTickets = data?.tickets ?? 0;
        this.playerPurchases = data?.purchases || [];
      },
      error: (err) => {
        this.isLoadingPlayer = false;
        this.playerTickets = 0;
        this.playerPurchases = [];
        this.snackBar.open(
          'Error loading player balance: ' +
            (err?.error?.message || 'Player not found in economy database'),
          'OK',
          { duration: 4000 }
        );
      },
    });
  }

  onAdjustTickets(quickAmount?: number, quickAction?: 'add' | 'remove' | 'set'): void {
    if (!this.selectedAccountId) return;

    const action = quickAction || this.ticketAction;
    const amount =
      quickAmount !== undefined
        ? quickAmount
        : Number(this.ticketAmountControl.value) || 0;

    if (amount <= 0 && action !== 'set') {
      this.snackBar.open('Please specify a positive ticket amount', 'OK', {
        duration: 3000,
      });
      return;
    }

    this.isAdjustingTickets = true;
    this.adminService
      .manageTickets(this.selectedAccountId, amount, action)
      .subscribe({
        next: (res) => {
          this.isAdjustingTickets = false;
          this.playerTickets = res.new_balance;
          this.snackBar.open(
            `Successfully updated tickets! New balance: ${res.new_balance}`,
            'OK',
            { duration: 3000 }
          );
          this.loadEconomyLeaderboard();
        },
        error: (err) => {
          this.isAdjustingTickets = false;
          this.snackBar.open(
            'Failed to update tickets: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  onGrantItem(): void {
    if (!this.selectedAccountId) return;
    const itemId = this.grantItemIdControl.value?.trim();
    if (!itemId) {
      this.snackBar.open('Please specify an item name/ID', 'OK', {
        duration: 3000,
      });
      return;
    }

    const usages =
      this.grantType === 'command'
        ? Number(this.grantUsagesControl.value) || 3
        : undefined;

    this.isGrantingItem = true;
    this.adminService
      .grantPurchase(this.selectedAccountId, this.grantType, itemId, usages)
      .subscribe({
        next: () => {
          this.isGrantingItem = false;
          this.snackBar.open(
            `Granted ${this.grantType} "${itemId}" to ${this.selectedAccountId}`,
            'OK',
            { duration: 3000 }
          );
          this.onSearchPlayer();
          this.loadActivePurchasers();
        },
        error: (err) => {
          this.isGrantingItem = false;
          this.snackBar.open(
            'Failed to grant item: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  onRevokeItem(item: PurchaseItem): void {
    if (!this.selectedAccountId) return;
    if (
      !confirm(
        `Revoke ${item.item_type} "${item.item_id}" from ${this.selectedAccountId}?`
      )
    ) {
      return;
    }

    this.adminService
      .revokePurchase(this.selectedAccountId, item.item_type, item.item_id)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Revoked ${item.item_type} "${item.item_id}"`,
            'OK',
            { duration: 3000 }
          );
          this.onSearchPlayer();
          this.loadActivePurchasers();
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to revoke item: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  onChangeCommandUsages(item: PurchaseItem, delta: number): void {
    if (!this.selectedAccountId) return;
    const current = item.usages_left ?? 0;
    const nextUsages = Math.max(0, current + delta);

    this.adminService
      .updateCommandUsages(this.selectedAccountId, item.item_id, nextUsages)
      .subscribe({
        next: () => {
          item.usages_left = nextUsages;
          if (nextUsages === 0) {
            this.playerPurchases = this.playerPurchases.filter(
              (p) => !(p.item_id === item.item_id && p.item_type === 'command')
            );
            this.snackBar.open(
              `Command "${item.item_id}" depleted and removed`,
              'OK',
              { duration: 3000 }
            );
          } else {
            this.snackBar.open(
              `Updated usages for "${item.item_id}" to ${nextUsages}`,
              'OK',
              { duration: 2500 }
            );
          }
          this.loadActivePurchasers();
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to update usages: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  getCommandPurchases(): PurchaseItem[] {
    return this.playerPurchases.filter((p) => p.item_type === 'command');
  }

  getEffectPurchases(): PurchaseItem[] {
    return this.playerPurchases.filter((p) => p.item_type === 'effect');
  }

  // ==================== Tab 2: Server-Wide Active Purchasers ====================

  loadActivePurchasers(): void {
    this.isLoadingPurchasers = true;
    this.adminService
      .getActivePurchasers(this.purchaserPage, this.purchaserPerPage)
      .subscribe({
        next: (data) => {
          this.isLoadingPurchasers = false;
          this.purchasersDataSource.data = data?.purchases || [];
          this.totalPurchasers = data?.total || 0;
        },
        error: (err) => {
          this.isLoadingPurchasers = false;
          this.purchasersDataSource.data = [];
          this.snackBar.open(
            'Failed to load active purchases list: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  onPurchaserPageChange(event: PageEvent): void {
    this.purchaserPage = event.pageIndex + 1;
    this.purchaserPerPage = event.pageSize;
    this.loadActivePurchasers();
  }

  revokePurchaserRecord(item: PurchaserItem): void {
    if (
      !confirm(
        `Revoke ${item.item_type} "${item.item_id}" from player ${item.name || item.account_id}?`
      )
    ) {
      return;
    }

    this.adminService
      .revokePurchase(item.account_id, item.item_type, item.item_id)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Revoked ${item.item_type} "${item.item_id}" from ${item.account_id}`,
            'OK',
            { duration: 3000 }
          );
          this.loadActivePurchasers();
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to revoke purchase: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  // ==================== Tab 3: Transaction Logs ====================

  loadTransactions(): void {
    this.isLoadingTransactions = true;
    const filterAccount = this.filterAccountControl.value?.trim() || undefined;

    this.adminService
      .getTransactions(
        this.transactionPage,
        this.transactionPerPage,
        filterAccount
      )
      .subscribe({
        next: (data) => {
          this.isLoadingTransactions = false;
          this.transactionsDataSource.data = data?.transactions || [];
          this.totalTransactions = data?.total || 0;
        },
        error: (err) => {
          this.isLoadingTransactions = false;
          this.transactionsDataSource.data = [];
          this.snackBar.open(
            'Failed to load transactions: ' +
              (err?.error?.message || err?.message || 'Server error'),
            'OK',
            { duration: 4000 }
          );
        },
      });
  }

  onTransactionPageChange(event: PageEvent): void {
    this.transactionPage = event.pageIndex + 1;
    this.transactionPerPage = event.pageSize;
    this.loadTransactions();
  }

  onFilterTransactions(): void {
    this.transactionPage = 1;
    this.loadTransactions();
  }

  clearTransactionFilter(): void {
    this.filterAccountControl.setValue('');
    this.transactionPage = 1;
    this.loadTransactions();
  }
}
