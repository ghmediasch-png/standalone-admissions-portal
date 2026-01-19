// fees-loader.js
// Supabase Configuration
const SUPABASE_URL = 'https://fyriapqeztevzkcaaiqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cmlhcHFlenRldnprY2FhaXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTgyNTcsImV4cCI6MjA3OTU3NDI1N30.Re3EZ2VXE6Z7qWhVlxV6yqqIWB8wj1b1wURNLZXpddY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mapping of page identifiers to their respective Supabase table names
const PAGE_TO_TABLE_MAP = {
    'gh-media-school': 'fees_gh_media_school',
    'gh-fashion-school': 'fees_gh_fashion_school',
    'gh-cosmetology-school': 'fees_gh_cosmetology_school',
    'gh-catering-school': 'fees_gh_catering_school',
    'gh-technology-school': 'fees_gh_technology_school'
};

/**
 * Test Supabase connection
 */
async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...');
    console.log('📌 URL:', SUPABASE_URL);
    console.log('🔑 Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    try {
        const { data, error } = await supabase
            .from('fees_gh_media_school')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase connection FAILED:', error);
            return false;
        }
        
        console.log('✅ Supabase connection SUCCESS!');
        console.log('📊 Sample data:', data);
        return true;
    } catch (error) {
        console.error('❌ Unexpected error during connection test:', error);
        return false;
    }
}

/**
 * Format amount for display
 * Handles numbers, "Free", "Varies", and other text values
 */
function formatAmount(amount) {
    // Check if it's a number (or string that looks like a number)
    const numericAmount = parseFloat(amount);
    
    if (!isNaN(numericAmount)) {
        // Format with commas for thousands
        return numericAmount.toLocaleString('en-US');
    }
    
    // Return as-is for non-numeric values (Free, Varies, etc.)
    return amount;
}

/**
 * Parse amount to number (only numeric values)
 * Returns 0 for non-numeric values like "Free", "Varies", etc.
 */
function parseAmount(amount) {
    // Remove commas if any (though DB doesn't have them)
    const cleanAmount = String(amount).replace(/,/g, '');
    const numericValue = parseFloat(cleanAmount);
    
    // Only return if it's a valid number
    return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Check if a fee item is a hostel-related row
 */
function isHostelRow(itemName) {
    return String(itemName).toLowerCase().includes('hostel');
}

/**
 * Append total rows to the table
 */
function appendTotalRows(fees, tableElement) {
    let totalWithHostel = 0;
    let totalWithoutHostel = 0;
    
    // Calculate totals
    fees.forEach(fee => {
        const numericAmount = parseAmount(fee.amount);
        const isHostel = isHostelRow(fee.item_name);
        
        // Add to total with hostel
        totalWithHostel += numericAmount;
        
        // Add to total without hostel (skip if hostel row)
        if (!isHostel) {
            totalWithoutHostel += numericAmount;
        }
    });
    
    console.log('💰 Total with hostel:', totalWithHostel);
    console.log('💰 Total without hostel:', totalWithoutHostel);
    
    // Find or create tfoot
    let tfoot = tableElement.querySelector('tfoot');
    if (!tfoot) {
        tfoot = document.createElement('tfoot');
        tableElement.appendChild(tfoot);
    }
    
    // Clear existing totals (if any)
    tfoot.innerHTML = '';
    
    // Create total rows
    const totalWithHostelRow = document.createElement('tr');
    totalWithHostelRow.className = 'total-row';
    totalWithHostelRow.innerHTML = `
        <td colspan="2"><strong>Total fees plus hostel</strong></td>
        <td class="text-right"><strong>${formatAmount(totalWithHostel)}</strong></td>
    `;
    
    const totalWithoutHostelRow = document.createElement('tr');
    totalWithoutHostelRow.className = 'total-row';
    totalWithoutHostelRow.innerHTML = `
        <td colspan="2"><strong>Total fees minus hostel</strong></td>
        <td class="text-right"><strong>${formatAmount(totalWithoutHostel)}</strong></td>
    `;
    
    // Append to tfoot
    tfoot.appendChild(totalWithHostelRow);
    tfoot.appendChild(totalWithoutHostelRow);
}

/**
 * Render fees table rows
 */
function renderFeesTable(fees, tbodyElement) {
    // Clear loading message
    tbodyElement.innerHTML = '';
    
    if (!fees || fees.length === 0) {
        // Show friendly message if no data
        tbodyElement.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem;">
                    Fee information coming soon.
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`✅ Rendering ${fees.length} fee items`);
    
    // Generate table rows
    fees.forEach(fee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fee.serial_number}</td>
            <td>${fee.item_name}</td>
            <td class="text-right">${formatAmount(fee.amount)}</td>
        `;
        tbodyElement.appendChild(row);
    });
    
    // Get the parent table element
    const tableElement = tbodyElement.closest('table');
    
    // Append totals to the table
    if (tableElement) {
        appendTotalRows(fees, tableElement);
    }
    
    console.log('✅ Table rendered successfully with totals!');
}

/**
 * Show error message in table
 */
function showError(tbodyElement, message) {
    tbodyElement.innerHTML = `
        <tr>
            <td colspan="3" style="text-align: center; padding: 2rem; color: #c0392b;">
                ${message}
            </td>
        </tr>
    `;
}

/**
 * Fetch and display fees for a specific school
 */
async function loadSchoolFees(schoolIdentifier) {
    console.log('🎓 Loading fees for:', schoolIdentifier);
    
    const tbodyElement = document.getElementById('fees-table-body');
    
    if (!tbodyElement) {
        console.error('❌ Fees table body not found on this page');
        console.log('💡 Make sure you have <tbody id="fees-table-body"> in your HTML');
        return;
    }
    
    console.log('✅ Table body element found');
    
    // Show loading state
    tbodyElement.innerHTML = `
        <tr>
            <td colspan="3" style="text-align: center; padding: 2rem;">
                Loading fees...
            </td>
        </tr>
    `;
    
    // Get the table name for this school
    const tableName = PAGE_TO_TABLE_MAP[schoolIdentifier];
    
    if (!tableName) {
        console.error('❌ Invalid school identifier:', schoolIdentifier);
        showError(tbodyElement, 'Invalid school identifier');
        return;
    }
    
    console.log('📋 Fetching from table:', tableName);
    
    try {
        // Fetch data from Supabase
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('serial_number', { ascending: true });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            showError(tbodyElement, 'Unable to load fees. Please try again later.');
            return;
        }
        
        console.log('✅ Data fetched successfully:', data);
        
        // Render the table
        renderFeesTable(data, tbodyElement);
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        showError(tbodyElement, 'Unable to load fees. Please try again later.');
    }
}

/**
 * Initialize fees loader when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Fees loader initialized');
    
    // First, test the connection
    await testSupabaseConnection();
    
    // Get the page identifier from the data-school attribute on body
    const schoolIdentifier = document.body.getAttribute('data-school');
    
    console.log('📄 Page identifier:', schoolIdentifier);
    
    if (schoolIdentifier) {
        loadSchoolFees(schoolIdentifier);
    } else {
        console.log('ℹ️ No school identifier found - this page does not need fees loading');
    }
});