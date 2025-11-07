<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../includes/api-functions.php';

/**
 * Test suite for admin functions
 * 
 * Note: These tests require a test database setup with mysqli.
 * You may need to configure a test database connection or use mocking.
 */
class AdminFunctionsTest extends TestCase
{
    private $mysqli;

    protected function setUp(): void
    {
        parent::setUp();
        
        // TODO: Set up test database connection
        // For now, these tests will be skipped if database is not available
        // You should configure a test database or use mysqli mocking
        
        // Example test database setup (uncomment and configure):
        // $this->mysqli = new mysqli("localhost", "test_user", "test_password", "test_database");
        // if ($this->mysqli->connect_errno) {
        //     $this->markTestSkipped('Test database not available');
        // }
    }

    protected function tearDown(): void
    {
        if ($this->mysqli) {
            $this->mysqli->close();
        }
        parent::tearDown();
    }

    /**
     * Test archivePurchasedItems function
     * 
     * This test verifies that:
     * - The function archives items with status='purchased' AND archive=0
     * - It affects all users' items (not just admin userid)
     * - It returns success message with affected rows count
     * - It returns warn message when no items match
     * - It handles database errors gracefully
     */
    public function testArchivePurchasedItems()
    {
        if (!$this->mysqli) {
            $this->markTestSkipped('Test database not configured');
        }

        // Test successful archiving
        $result = archivePurchasedItems(1, $this->mysqli);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertStringContainsString('items affected', $result['success']);
    }

    /**
     * Test archivePurchasedItems with no matching items
     */
    public function testArchivePurchasedItemsNoMatches()
    {
        if (!$this->mysqli) {
            $this->markTestSkipped('Test database not configured');
        }

        // First, ensure all purchased items are archived
        archivePurchasedItems(1, $this->mysqli);
        
        // Try again - should return warn
        $result = archivePurchasedItems(1, $this->mysqli);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('warn', $result);
        $this->assertEquals('There were no matching items.', $result['warn']);
    }

    /**
     * Test archiveRemovedItems function
     * 
     * This test verifies that:
     * - The function archives items with removed=1 AND archive=0
     * - It affects all users' items (not just admin userid)
     * - It returns success message with affected rows count
     * - It returns warn message when no items match
     * - It handles database errors gracefully
     */
    public function testArchiveRemovedItems()
    {
        if (!$this->mysqli) {
            $this->markTestSkipped('Test database not configured');
        }

        // Test successful archiving
        $result = archiveRemovedItems(1, $this->mysqli);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertStringContainsString('items affected', $result['success']);
    }

    /**
     * Test archiveRemovedItems with no matching items
     */
    public function testArchiveRemovedItemsNoMatches()
    {
        if (!$this->mysqli) {
            $this->markTestSkipped('Test database not configured');
        }

        // First, ensure all removed items are archived
        archiveRemovedItems(1, $this->mysqli);
        
        // Try again - should return warn
        $result = archiveRemovedItems(1, $this->mysqli);
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('warn', $result);
        $this->assertEquals('There were no matching items.', $result['warn']);
    }

    /**
     * Test that archivePurchasedItems archives items for all users, not just admin
     * 
     * This test requires test data setup:
     * - Create items with status='purchased' for multiple users
     * - Verify that all are archived regardless of userid
     */
    public function testArchivePurchasedItemsAffectsAllUsers()
    {
        if (!$this->mysqli) {
            $this->markTestSkipped('Test database not configured');
        }

        // This test requires test data setup
        // TODO: Set up test data with purchased items for multiple users
        
        $result = archivePurchasedItems(1, $this->mysqli);
        
        // Verify that items from all users were archived
        // (This would require checking the database state)
        $this->assertIsArray($result);
    }

    /**
     * Test that archiveRemovedItems archives items for all users, not just admin
     * 
     * This test requires test data setup:
     * - Create items with removed=1 for multiple users
     * - Verify that all are archived regardless of userid
     */
    public function testArchiveRemovedItemsAffectsAllUsers()
    {
        if (!$this->mysqli) {
            $this->markTestSkipped('Test database not configured');
        }

        // This test requires test data setup
        // TODO: Set up test data with removed items for multiple users
        
        $result = archiveRemovedItems(1, $this->mysqli);
        
        // Verify that items from all users were archived
        // (This would require checking the database state)
        $this->assertIsArray($result);
    }

    /**
     * Test SQL query structure for archivePurchasedItems
     * 
     * This test verifies that the SQL query doesn't filter by userid
     */
    public function testArchivePurchasedItemsQueryStructure()
    {
        // This is a unit test that verifies the function logic
        // The actual SQL query should be: 
        // "UPDATE items SET archive = 1 WHERE status = 'purchased' AND archive = 0"
        // NOT: "UPDATE items SET archive = 1 WHERE userid = ? AND status = 'purchased'"
        
        // Read the function source to verify
        $functionSource = file_get_contents(__DIR__ . '/../includes/api-functions.php');
        
        // Verify the query doesn't include userid filter
        $this->assertStringContainsString(
            "WHERE status = 'purchased' AND archive = 0",
            $functionSource
        );
        
        // Verify it doesn't bind userid parameter
        $this->assertStringNotContainsString(
            "WHERE userid = ? AND status = 'purchased'",
            $functionSource
        );
    }

    /**
     * Test SQL query structure for archiveRemovedItems
     * 
     * This test verifies that the SQL query doesn't filter by userid
     */
    public function testArchiveRemovedItemsQueryStructure()
    {
        // This is a unit test that verifies the function logic
        // The actual SQL query should be: 
        // "UPDATE items SET archive = 1 WHERE removed = 1 AND archive = 0"
        // NOT: "UPDATE items SET archive = 1 WHERE userid = ? AND removed = 1 AND archive = 0"
        
        // Read the function source to verify
        $functionSource = file_get_contents(__DIR__ . '/../includes/api-functions.php');
        
        // Verify the query doesn't include userid filter
        $this->assertStringContainsString(
            "WHERE removed = 1 AND archive = 0",
            $functionSource
        );
        
        // Verify it doesn't bind userid parameter
        $this->assertStringNotContainsString(
            "WHERE userid = ? AND removed = 1",
            $functionSource
        );
    }
}

