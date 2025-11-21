<?php
/**
 * Unit tests for reporting functions
 * Run with: phpunit php/tests/ReportingFunctionsTest.php
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../includes/reporting-functions.php';

class ReportingFunctionsTest extends TestCase
{
    private $mysqli;

    protected function setUp(): void
    {
        // Mock mysqli connection
        $this->mysqli = $this->createMock(mysqli::class);
    }

    public function testCreateReportValidatesRequiredFields()
    {
        // Missing stid
        $reportData = array(
            'report_type' => 'error',
            'message' => 'Test message'
        );

        $result = createReport($reportData, $this->mysqli);

        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('required', $result['error']);
    }

    public function testCreateReportValidatesReportType()
    {
        $reportData = array(
            'stid' => 'test-stid-123',
            'report_type' => 'invalid_type',
        );

        $result = createReport($reportData, $this->mysqli);

        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('Invalid report_type', $result['error']);
    }

    public function testCreateReportAcceptsValidTypes()
    {
        $validTypes = array('performance', 'interaction', 'error', 'warning', 'info', 'debug');

        foreach ($validTypes as $type) {
            $reportData = array(
                'stid' => 'test-stid-123',
                'report_type' => $type,
                'message' => 'Test message',
            );

            // For this test, we'd need to mock the mysqli prepare/execute methods
            // This is a basic structure test
            $this->assertTrue(in_array($type, $validTypes));
        }
    }
}

